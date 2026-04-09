import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService, Archive } from '../../../services/archive.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {
  archives: Archive[] = [];
  
  showAddForm = false;
  showDeleteConfirm = false;
  
  editingArchiveId: number | null = null;
  deletingArchiveId: number | null = null;
  
  newArchiveTitle = '';
  newArchiveUrl = '';

  constructor(private archiveService: ArchiveService) {}

  ngOnInit() {
    this.loadArchives();
  }

  loadArchives() {
    this.archiveService.getArchives().subscribe({
      next: (data: Archive[]) => {
        this.archives = data;
      },
      error: (err: any) => console.error('Error loading archives', err)
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  openEditForm(archive: Archive) {
    this.editingArchiveId = archive.id!;
    this.newArchiveTitle = archive.title;
    this.newArchiveUrl = archive.url;
    this.showAddForm = true;
  }

  saveArchive() {
    if (this.newArchiveTitle.trim() && this.newArchiveUrl.trim()) {
      if (this.editingArchiveId) {
        // Edit mode
        const updatedArchive: Archive = {
          title: this.newArchiveTitle,
          url: this.newArchiveUrl
        };
        
        this.archiveService.updateArchive(this.editingArchiveId, updatedArchive).subscribe({
          next: () => {
            this.loadArchives();
            this.toggleAddForm();
          },
          error: (err: any) => console.error('Error updating archive video', err)
        });
      } else {
        // Add mode
        const newArchive: Archive = {
          title: this.newArchiveTitle,
          url: this.newArchiveUrl
        };
        
        this.archiveService.addArchive(newArchive).subscribe({
          next: (savedArchive: Archive) => {
            this.archives.push(savedArchive);
            this.toggleAddForm();
          },
          error: (err: any) => console.error('Error adding archive video', err)
        });
      }
    }
  }

  promptDelete(id: number) {
    this.deletingArchiveId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.deletingArchiveId = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete() {
    if (this.deletingArchiveId) {
      this.archiveService.deleteArchive(this.deletingArchiveId).subscribe({
        next: () => {
          this.archives = this.archives.filter(a => a.id !== this.deletingArchiveId);
          this.cancelDelete();
        },
        error: (err: any) => console.error('Error deleting archive video', err)
      });
    }
  }
  
  resetForm() {
    this.editingArchiveId = null;
    this.newArchiveTitle = '';
    this.newArchiveUrl = '';
  }
}
