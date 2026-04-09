import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleService, Schedule } from '../../../services/schedule.service';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
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

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit() {
    this.loadSchedules();
  }

  loadSchedules() {
    this.scheduleService.getSchedules().subscribe({
      next: (data: Schedule[]) => {
        this.schedules = data;
      },
      error: (err: any) => console.error('Error loading schedules', err)
    });
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
      if (this.editingScheduleId) {
        // Edit mode (file is optional if it's already uploaded, but Service expects a File | null)
        this.scheduleService.updateSchedule(this.editingScheduleId, this.newScheduleTitle, this.selectedFile).subscribe({
          next: () => {
            this.loadSchedules();
            this.toggleAddForm();
          },
          error: (err: any) => console.error('Error updating schedule', err)
        });
      } else {
        // Add mode (must have file)
        if (this.selectedFile) {
           this.scheduleService.addSchedule(this.newScheduleTitle, this.selectedFile).subscribe({
             next: (savedSchedule: Schedule) => {
               this.schedules.push(savedSchedule);
               this.toggleAddForm();
             },
             error: (err: any) => console.error('Error adding schedule', err)
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
      this.scheduleService.deleteSchedule(this.deletingScheduleId).subscribe({
        next: () => {
          this.schedules = this.schedules.filter(s => s.id !== this.deletingScheduleId);
          this.cancelDelete();
        },
        error: (err: any) => console.error('Error deleting schedule', err)
      });
    }
  }

  openPdf(fileName: string | undefined) {
    if (fileName) {
       window.open(`${environment.apiUrl}/schedules/files/${fileName}`, '_blank');
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
