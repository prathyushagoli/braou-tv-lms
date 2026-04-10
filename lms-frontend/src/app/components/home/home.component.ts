import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

import { LiveStreamService, LiveStream } from '../../services/live-stream.service';
import { CourseService, Course } from '../../services/course.service';
import { ProgrammeService, Programme } from '../../services/programme.service';
import { EventService, Event as AppEvent } from '../../services/event.service';
import { ScheduleService, Schedule } from '../../services/schedule.service';
import { ContactService, Contact } from '../../services/contact.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var confetti: any;

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
  uniqueFaculties: string[] = [];
  
  activeLiveStream: LiveStream | null = null;
  activeLiveName: string = '';
  
  contactObj: Contact | null = null;

  showLaunchModal = false;
  isVideoLaunched = false;
  private confettiInterval: any;

  constructor(
    private liveStreamService: LiveStreamService,
    private courseService: CourseService,
    private programmeService: ProgrammeService,
    private eventService: EventService,
    private scheduleService: ScheduleService,
    private contactService: ContactService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchLiveStreams();
    this.fetchLatestData();
    this.fetchContact();
  }

  fetchContact() {
    this.contactService.getContact().subscribe({
      next: (data) => this.contactObj = data,
      error: (err) => console.error('Error fetching contact configuration', err)
    });
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
      
      const faculties = new Set<string>([
        'Faculty of Arts',
        'Faculty of Commerce and Business Management',
        'Faculty of Sciences',
        'Faculty of Social Sciences',
        'Faculty of Education'
      ]);
      data.forEach(c => {
        if (c.faculty) faculties.add(c.faculty);
      });
      this.uniqueFaculties = Array.from(faculties).sort();
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
      const url = this.getFileUrl(fileName);
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.write('Loading PDF preview securely...');
        this.http.get(url, { responseType: 'blob' }).subscribe({
          next: (data: Blob) => {
            const blob = new Blob([data], { type: 'application/pdf' });
            const blobUrl = window.URL.createObjectURL(blob);
            newTab.location.href = blobUrl;
          },
          error: (err) => {
            console.error('Error loading preview', err);
            newTab.document.write('Failed to load PDF preview.');
          }
        });
      }
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

  initiateLaunch() {
    this.showLaunchModal = true;
    this.isVideoLaunched = false;
    this.fireConfettiLoop();

    // After 10s organically load the YouTube iframe only if a URL actually exists!
    setTimeout(() => {
      if (this.contactObj && this.contactObj.launchVideoUrl && this.contactObj.launchVideoUrl.trim().length > 0) {
        this.clearConfetti();
        this.isVideoLaunched = true;
      }
      // If no video URL is provided, the UI simply remains in the highly animated launch state indefinitely!
    }, 10000);
  }

  fireConfettiLoop() {
    if (typeof confetti === 'undefined') return;
    
    // Side confetti streams continuously for 10 seconds
    var duration = 10000;
    var animationEnd = Date.now() + duration;
    
    var defaults = {
      spread: 55,
      ticks: 100,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 55,
      colors: ['#3b82f6', '#ef4444', '#10b981', '#fcd34d', '#ffffff'],
      zIndex: 9999
    };

    // Single intense center burst immediately
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5 },
        startVelocity: 45,
        zIndex: 9999
      });
    }, 100);

    // Continuous Left (60deg) and Right (120deg) streams
    this.confettiInterval = setInterval(() => {
      var timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(this.confettiInterval);
      }
      var particleCount = 40 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, { particleCount, angle: 60, origin: { x: 0, y: 0.7 } }));
      confetti(Object.assign({}, defaults, { particleCount, angle: 120, origin: { x: 1, y: 0.7 } }));
    }, 200);
  }

  clearConfetti() {
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
    }
    if (typeof confetti !== 'undefined' && typeof confetti.reset === 'function') {
      confetti.reset();
    }
  }

  closeLaunchModal() {
    this.showLaunchModal = false;
    this.isVideoLaunched = false;
    this.clearConfetti();
  }
}
