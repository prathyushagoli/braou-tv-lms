import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService, Event } from '../../../services/event.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  
  showAddForm = false;
  showDeleteConfirm = false;
  activeTab = 'Convocations';
  
  editingEventId: number | null = null;
  deletingEventId: number | null = null;
  dropdownOpen = false;
  
  newEventTitle = '';
  newEventUrl = '';
  newEventType = 'Convocations';
  newEventDate = '';

  tabs = ['Convocations', 'Seminars', 'Concerts', 'Workshop'];

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (data: Event[]) => {
        this.events = data;
      },
      error: (err: any) => console.error('Error loading events', err)
    });
  }

  get filteredEvents(): Event[] {
    return this.events.filter(e => e.type === this.activeTab);
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  openEditForm(event: Event) {
    this.editingEventId = event.id!;
    this.newEventTitle = event.title;
    this.newEventUrl = event.url;
    this.newEventType = event.type;
    this.newEventDate = event.eventDate || '';
    this.showAddForm = true;
  }

  saveEvent() {
    if (this.newEventTitle.trim() && this.newEventUrl.trim() && this.newEventType) {
      if (this.editingEventId) {
        // Edit mode
        const updatedEvent: Event = {
          title: this.newEventTitle,
          url: this.newEventUrl,
          type: this.newEventType,
          eventDate: this.newEventDate
        };
        
        this.eventService.updateEvent(this.editingEventId, updatedEvent).subscribe({
          next: () => {
            this.loadEvents();
            this.toggleAddForm();
          },
          error: (err: any) => console.error('Error updating event', err)
        });
      } else {
        // Add mode
        const newEvent: Event = {
          title: this.newEventTitle,
          url: this.newEventUrl,
          type: this.newEventType,
          eventDate: this.newEventDate
        };
        
        this.eventService.addEvent(newEvent).subscribe({
          next: (savedEvent: Event) => {
            this.events.push(savedEvent);
            this.toggleAddForm();
          },
          error: (err: any) => console.error('Error adding event', err)
        });
      }
    }
  }

  promptDelete(id: number) {
    this.deletingEventId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.deletingEventId = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete() {
    if (this.deletingEventId) {
      this.eventService.deleteEvent(this.deletingEventId).subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== this.deletingEventId);
          this.cancelDelete();
        },
        error: (err: any) => console.error('Error deleting event', err)
      });
    }
  }
  
  resetForm() {
    this.editingEventId = null;
    this.newEventTitle = '';
    this.newEventUrl = '';
    this.newEventType = this.activeTab;
    this.newEventDate = '';
  }
}
