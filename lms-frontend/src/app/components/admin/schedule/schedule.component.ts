import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleService, Schedule } from '../../../services/schedule.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  schedules: Schedule[] = [];
  
  showAddForm = false;
  showDeleteConfirm = false;
  
  editingScheduleId: number | null = null;
  deletingScheduleId: number | null = null;
  
  newScheduleTitle = '';
  selectedFile: File | null = null;
  
  isDragging = false;
  isSaving = false;
  isDeleting = false;
  isSaved = false;

  constructor(private scheduleService: ScheduleService, private http: HttpClient) {}

  ngOnInit() {
    this.loadSchedules();
  }

  loadSchedules() {
    this.scheduleService.getSchedules().subscribe({
      next: (data: Schedule[]) => {
        this.schedules = data.sort((a, b) => (b.id || 0) - (a.id || 0));
      },
      error: (err: any) => console.error('Error loading schedules', err)
    });
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    if (this.showAddForm && !this.isSaving && !this.isSaved) {
      if (this.newScheduleTitle.trim() && (this.selectedFile || this.editingScheduleId)) {
        event.preventDefault();
        this.saveSchedule();
      }
    } else if (this.showDeleteConfirm && !this.isDeleting && !this.isSaved) {
      event.preventDefault();
      this.confirmDelete();
    }
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  openEditForm(schedule: Schedule) {
    this.editingScheduleId = schedule.id!;
    this.newScheduleTitle = schedule.title;
    this.selectedFile = null; // Don't pre-populate file input
    this.showAddForm = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      alert("Please upload a PDF file.");
    }
  }

  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile = file;
      } else {
        alert("Please upload a PDF file.");
      }
    }
  }

  saveSchedule() {
    if (this.newScheduleTitle.trim() && (this.selectedFile || this.editingScheduleId)) {
      this.isSaving = true;
      this.isSaved = false;
      if (this.editingScheduleId) {
        // Edit mode
        this.scheduleService.updateSchedule(this.editingScheduleId, this.newScheduleTitle, this.selectedFile).subscribe({
          next: () => {
            this.loadSchedules();
            this.isSaving = false;
            this.isSaved = true;
            setTimeout(() => {
              this.toggleAddForm();
              this.isSaved = false;
            }, 1000);
          },
          error: (err: any) => {
            console.error('Error updating schedule', err);
            this.isSaving = false;
          }
        });
      } else {
        // Add mode
        if (this.selectedFile) {
           this.scheduleService.addSchedule(this.newScheduleTitle, this.selectedFile).subscribe({
             next: (savedSchedule: Schedule) => {
               this.schedules.unshift(savedSchedule);
               this.isSaving = false;
               this.isSaved = true;
               setTimeout(() => {
                 this.toggleAddForm();
                 this.isSaved = false;
               }, 1000);
             },
             error: (err: any) => {
               console.error('Error adding schedule', err);
               this.isSaving = false;
             }
           });
        }
      }
    }
  }

  promptDelete(id: number) {
    this.deletingScheduleId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.deletingScheduleId = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete() {
    if (this.deletingScheduleId) {
      this.isDeleting = true;
      this.isSaved = false;
      this.scheduleService.deleteSchedule(this.deletingScheduleId).subscribe({
        next: () => {
          this.schedules = this.schedules.filter(s => s.id !== this.deletingScheduleId);
          this.isDeleting = false;
          this.isSaved = true;
          setTimeout(() => {
            this.cancelDelete();
            this.isSaved = false;
          }, 1000);
        },
        error: (err: any) => {
          console.error('Error deleting schedule', err);
          this.isDeleting = false;
        }
      });
    }
  }

  openPdf(fileName: string | undefined) {
    if (fileName) {
      const url = `${environment.apiUrl}/schedules/files/${fileName}`;
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

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    
    const nth = function(d: number) {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }
    
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const day = date.getDate();
    return `${months[date.getMonth()]} ${day}${nth(day)}, ${date.getFullYear()}`;
  }
  
  resetForm() {
    this.editingScheduleId = null;
    this.newScheduleTitle = '';
    this.selectedFile = null;
  }
}
