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
        this.streams = data;
        this.filterStreams();
      },
      error: (err: any) => console.error('Error fetching university live streams', err)
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
    this.currentPage = 1;
    this.activeVideoId = undefined;
  }

  currentPage = 1;
  itemsPerPage = 12;
  activeVideoId: number | undefined = undefined;

  get paginatedSessions() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.pastSessions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.pastSessions.length / this.itemsPerPage) || 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.activeVideoId = undefined;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  playVideo(sessionId: number | undefined) {
    this.activeVideoId = sessionId;
  }

  extractVideoId(url: string | undefined): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getSafeUrl(url: string | undefined, autoplay: boolean = false): SafeResourceUrl | null {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;
    // Note: Due to strict modern browser policies, autoplaying with audio may be blocked
    // requiring the user to tap play manually if they haven't interacted with the page yet.
    const urlStr = autoplay 
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
      : `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlStr);
  }
}
