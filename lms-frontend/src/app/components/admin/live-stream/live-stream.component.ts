import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveStreamService, LiveStream } from '../../../services/live-stream.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-live-stream',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './live-stream.component.html',
  styleUrls: ['./live-stream.component.css']
})
export class LiveStreamComponent implements OnInit {
  streams: LiveStream[] = [];
  
  showAddForm = false;
  showDeleteConfirm = false;
  activeTab = 'University live programs';
  
  editingStreamId: number | null = null;
  deletingStreamId: number | null = null;
  
  dropdownOpen = false;
  showLiveConfirm = false;
  pendingLiveStreamId: number | null = null;
  pendingLiveStatus: boolean = false;
  
  newStreamName = '';
  newStreamUrl = '';
  newStreamCategory = 'University live programs';

  constructor(private liveStreamService: LiveStreamService) {}

  ngOnInit() {
    this.loadStreams();
  }

  loadStreams() {
    this.liveStreamService.getStreams().subscribe({
      next: (data) => {
        this.streams = data;
      },
      error: (err) => console.error('Error loading streams', err)
    });
  }

  get filteredStreams(): LiveStream[] {
    return this.streams
      .filter(s => s.category === this.activeTab)
      .sort((a, b) => {
        // Sort live streams to the top organically
        if (a.live === b.live) return 0;
        return a.live ? -1 : 1;
      });
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

  openEditForm(stream: LiveStream) {
    this.editingStreamId = stream.id!;
    this.newStreamName = stream.name;
    this.newStreamUrl = stream.url;
    this.newStreamCategory = stream.category;
    this.showAddForm = true;
  }

  saveStream() {
    if (this.newStreamName.trim() && this.newStreamUrl.trim() && this.newStreamCategory) {
      if (this.editingStreamId) {
        // Edit mode
        const updatedStream: LiveStream = {
          name: this.newStreamName,
          url: this.newStreamUrl,
          category: this.newStreamCategory,
          live: false
        };
        
        this.liveStreamService.updateStream(this.editingStreamId, updatedStream).subscribe({
          next: () => {
            this.loadStreams();
            this.toggleAddForm();
          },
          error: (err) => console.error('Error updating stream', err)
        });
      } else {
        // Add mode
        const newStream: LiveStream = {
          name: this.newStreamName,
          url: this.newStreamUrl,
          category: this.newStreamCategory,
          live: false
        };
        
        this.liveStreamService.addStream(newStream).subscribe({
          next: (savedStream) => {
            this.streams.push(savedStream);
            this.toggleAddForm();
          },
          error: (err) => console.error('Error adding stream', err)
        });
      }
    }
  }

  promptDelete(id: number) {
    this.deletingStreamId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.deletingStreamId = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete() {
    if (this.deletingStreamId) {
      this.liveStreamService.deleteStream(this.deletingStreamId).subscribe({
        next: () => {
          this.streams = this.streams.filter(s => s.id !== this.deletingStreamId);
          this.cancelDelete();
        },
        error: (err) => console.error('Error deleting stream', err)
      });
    }
  }

  toggleLiveStatus(stream: LiveStream, isChecked: boolean) {
    // Intercept with confirm dialog
    if (stream.id !== undefined) {
      this.pendingLiveStreamId = stream.id;
      this.pendingLiveStatus = isChecked;
      this.showLiveConfirm = true;
      // Revert UI toggle visually immediately, we'll confirm it on accept
      setTimeout(() => stream.live = !isChecked, 0); 
    }
  }

  cancelLiveToggle() {
    this.showLiveConfirm = false;
    this.pendingLiveStreamId = null;
  }

  confirmLiveToggle() {
    this.showLiveConfirm = false;
    if (this.pendingLiveStreamId !== null) {
      const stream = this.streams.find(s => s.id === this.pendingLiveStreamId);
      if (stream) {
        stream.live = this.pendingLiveStatus;
        if (this.pendingLiveStatus) {
           this.streams.forEach(s => {
             if (s.id !== stream.id && s.category === stream.category) {
               s.live = false;
             }
           });
        }
        
        this.liveStreamService.updateLiveStatus(stream.id!, this.pendingLiveStatus).subscribe({
          next: () => this.loadStreams(),
          error: (err) => {
            console.error('Error updating live status', err);
            this.loadStreams();
          }
        });
      }
      this.pendingLiveStreamId = null;
    }
  }
  
  resetForm() {
    this.editingStreamId = null;
    this.newStreamName = '';
    this.newStreamUrl = '';
    this.newStreamCategory = this.activeTab; // default to the current tab
  }
}

