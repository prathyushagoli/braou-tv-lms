import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventService, Event } from '../../../services/event.service';

@Component({
  selector: 'app-user-events',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './user-events.component.html',
  styleUrls: ['./user-events.component.css']
})
export class UserEventsComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  
  eventTypes: string[] = ['Convocations', 'Seminars', 'Concerts', 'Workshop'];
  activeType: string = 'Convocations';

  constructor(
    private eventService: EventService,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.eventService.getEvents().subscribe({
      next: (data: Event[]) => {
        this.events = data;
        this.filterEvents();
      },
      error: (err: any) => console.error('Error fetching university events', err)
    });
  }

  setActiveTab(type: string) {
    this.activeType = type;
    this.filterEvents();
  }

  filterEvents() {
    this.filteredEvents = this.events.filter(e => {
      // Basic fallback matches for casing
      return e.type.toLowerCase() === this.activeType.toLowerCase() ||
             (e.type + 's').toLowerCase() === this.activeType.toLowerCase() ||
             e.type.toLowerCase() === (this.activeType + 's').toLowerCase();
    });
  }

  // Same Youtube parsing logic as the unified Archive modules natively
  extractVideoId(url: string | undefined): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getSafeUrl(url: string | undefined): SafeResourceUrl | null {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
