import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveStreamService, LiveStream } from '../../../services/live-stream.service';
import { HttpClientModule } from '@angular/common/http';
import { SearchFilterPipe } from '../../../pipes/search-filter.pipe';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';

@Component({
  selector: 'app-live-stream',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SearchFilterPipe, AutoFocusDirective],
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
  
  isSaving = false;
  isDeleting = false;
  isTogglingLive = false;
  isSaved = false;
  
  newStreamName = '';
  newStreamUrl = '';
  newStreamCategory = 'University live programs';
  searchType = '';
  
  tabs = ['University live programs', 'Teleconferences'];

  constructor(private liveStreamService: LiveStreamService) {}

  ngOnInit() {
    this.loadStreams();
  }

  loadStreams() {
    this.liveStreamService.getStreams().subscribe({
      next: (data) => {
        this.streams = data.sort((a, b) => (b.id || 0) - (a.id || 0));
      },
      error: (err) => console.error('Error loading streams', err)
    });
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    if (this.showAddForm && !this.isSaving && !this.isSaved) {
      if (this.newStreamName.trim() && this.newStreamUrl.trim() && this.newStreamCategory) {
        event.preventDefault();
        this.saveStream();
      }
    } else if (this.showDeleteConfirm && !this.isDeleting && !this.isSaved) {
      event.preventDefault();
      this.confirmDelete();
    } else if (this.showLiveConfirm && !this.isTogglingLive && !this.isSaved) {
      event.preventDefault();
      this.confirmLiveToggle();
    }
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
      this.isSaving = true;
      this.isSaved = false;
      if (this.editingStreamId) {
        // Edit mode
        const updatedStream: LiveStream = {
          name: this.newStreamName,
          url: this.newStreamUrl,
          category: this.newStreamCategory,
          live: this.streams.find(s => s.id === this.editingStreamId)?.live || false
        };
        
        this.liveStreamService.updateStream(this.editingStreamId, updatedStream).subscribe({
          next: () => {
            this.loadStreams();
            this.isSaving = false;
            this.isSaved = true;
            setTimeout(() => {
              this.toggleAddForm();
              this.isSaved = false;
            }, 1000);
          },
          error: (err) => {
            console.error('Error updating stream', err);
            this.isSaving = false;
          }
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
            this.streams.unshift(savedStream);
            this.isSaving = false;
            this.isSaved = true;
            setTimeout(() => {
              this.toggleAddForm();
              this.isSaved = false;
            }, 1000);
          },
          error: (err) => {
            console.error('Error adding stream', err);
            this.isSaving = false;
          }
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
      this.isDeleting = true;
      this.isSaved = false;
      this.liveStreamService.deleteStream(this.deletingStreamId).subscribe({
        next: () => {
          this.streams = this.streams.filter(s => s.id !== this.deletingStreamId);
          this.isDeleting = false;
          this.isSaved = true;
          setTimeout(() => {
            this.cancelDelete();
            this.isSaved = false;
          }, 1000);
        },
        error: (err) => {
          console.error('Error deleting stream', err);
          this.isDeleting = false;
        }
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
    if (this.pendingLiveStreamId !== null) {
      this.isTogglingLive = true;
      this.isSaved = false;
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
          next: () => {
            this.isTogglingLive = false;
            this.isSaved = true;
            setTimeout(() => {
              this.cancelLiveToggle();
              this.isSaved = false;
            }, 1000);
          },
          error: (err) => {
            console.error('Error updating live status', err);
            this.loadStreams();
            this.isTogglingLive = false;
          }
        });
      } else {
        this.isTogglingLive = false;
        this.showLiveConfirm = false;
        this.pendingLiveStreamId = null;
      }
    }
  }
  
  resetForm() {
    this.editingStreamId = null;
    this.newStreamName = '';
    this.newStreamUrl = '';
    this.newStreamCategory = this.activeTab; // default to the current tab
    this.searchType = '';
    this.dropdownOpen = false;
  }
}

