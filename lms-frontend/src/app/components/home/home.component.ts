import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

import { LiveStreamService, LiveStream } from '../../services/live-stream.service';
import { CourseService, Course } from '../../services/course.service';
import { ProgrammeService, Programme } from '../../services/programme.service';
import { EventService, Event as AppEvent } from '../../services/event.service';
import { ScheduleService, Schedule } from '../../services/schedule.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  latestCourses: Course[] = [];
  latestProgrammes: Programme[] = [];
  latestEvents: AppEvent[] = [];
  latestSchedules: Schedule[] = [];
  
  activeLiveStream: LiveStream | null = null;
  activeLiveName: string = '';
  
  showLaunchModal = false;

  constructor(
    private liveStreamService: LiveStreamService,
    private courseService: CourseService,
    private programmeService: ProgrammeService,
    private eventService: EventService,
    private scheduleService: ScheduleService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchLiveStreams();
    this.fetchLatestData();
  }

  fetchLiveStreams() {
    this.liveStreamService.getStreams().subscribe({
      next: (data) => {
        // Find University first
        let live = data.find(s => s.live && s.category === 'University live programs');
        if (!live) {
           // Fallback to Teleconferences
           live = data.find(s => s.live && s.category === 'Teleconferences');
        }
        this.activeLiveStream = live || null;
      },
      error: (err) => console.error('Error fetching live streams:', err)
    });
  }

  fetchLatestData() {
    this.courseService.getCourses().subscribe(data => {
      this.latestCourses = data.slice(-4).reverse();
    });
    
    this.programmeService.getProgrammes().subscribe(data => {
      this.latestProgrammes = data.slice(-4).reverse();
    });
    
    this.eventService.getEvents().subscribe(data => {
      this.latestEvents = data.slice(-4).reverse();
    });
    
    this.scheduleService.getSchedules().subscribe(data => {
      this.latestSchedules = data.slice(-4).reverse();
    });
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
    const urlStr = autoplay 
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
      : `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlStr);
  }
  
  getSafeThumbnail(url: string | undefined): SafeResourceUrl | null {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;
    const urlStr = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlStr);
  }

  // Restore PDF thumbnail retrieval securely rendering inside custom iframes across the components
  getSafePdfUrl(fileName: string | undefined): SafeResourceUrl | null {
    if (!fileName) return null;
    const fileUrl = `${environment.apiUrl}/schedules/files/${fileName}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl + '#toolbar=0&navpanes=0&scrollbar=0');
  }

  // Handle file preview and downloading directly via blob bypassing implicit browser downloads on iframes
  getFileUrl(fileName: string | undefined): string {
    if (!fileName) return '#';
    return `${environment.apiUrl}/schedules/files/${fileName}`;
  }

  previewFile(fileName: string | undefined) {
    if (fileName) {
      window.open(this.getFileUrl(fileName), '_blank');
    }
  }

  downloadFile(event: Event, fileName: string | undefined) {
    event.stopPropagation();
    if (fileName) {
      const url = this.getFileUrl(fileName);
      this.http.get(url, { responseType: 'blob' }).subscribe({
        next: (blob: Blob) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(downloadUrl);
        },
        error: (err) => console.error('Error attempting direct download', err)
      });
    }
  }

  toggleModal() {
    this.showLaunchModal = !this.showLaunchModal;
  }
}
