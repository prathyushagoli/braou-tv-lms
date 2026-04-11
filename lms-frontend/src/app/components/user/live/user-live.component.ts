import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LiveStreamService, LiveStream } from '../../../services/live-stream.service';

@Component({
  selector: 'app-user-live',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-live.component.html',
  styleUrls: ['./user-live.component.css']
})
export class UserLiveComponent implements OnInit {
  streams: LiveStream[] = [];
  isLoading: boolean = true;
  filteredStreams: LiveStream[] = [];
  
  liveTypes: string[] = ['University live programs', 'Teleconferences'];
  activeType: string = 'University live programs';
  
  activeStream: LiveStream | null = null;
  pastSessions: LiveStream[] = [];

  constructor(
    private liveStreamService: LiveStreamService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.liveStreamService.getStreams().subscribe({
      next: (data: LiveStream[]) => {
        this.streams = data.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.isLoading = false;
        this.filterStreams();
      },
      error: (err: any) => {
        console.error('Error fetching university live streams', err);
        this.isLoading = false;
      }
    });
  }

  setActiveTab(type: string) {
    this.activeType = type;
    this.filterStreams();
  }

  filterStreams() {
    // Isolated array block protecting isolated bounds explicitly matching User prompt.
    this.filteredStreams = this.streams.filter(s => s.category === this.activeType);
    
    // Exactly one stream should be set to true at a time per our backend logic category bound
    this.activeStream = this.filteredStreams.find(s => s.live) || null;
    
    // Everything else maps explicitly to the past sessions array internally
    this.pastSessions = this.filteredStreams.filter(s => !s.live);
    this.activeVideoId = undefined;
  }

  activeVideoId: number | undefined = undefined;

  playVideo(sessionId: number | undefined) {
    this.activeVideoId = sessionId;
  }

  extractVideoId(url: string | undefined): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getSafeUrl(url: string | undefined, autoplay: boolean = false): SafeResourceUrl | null {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;
    // Note: Due to strict modern browser policies, autoplaying with audio may be blocked
    // requiring the user to tap play manually if they haven't interacted with the page yet.
    const urlStr = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlStr);
  }
}
