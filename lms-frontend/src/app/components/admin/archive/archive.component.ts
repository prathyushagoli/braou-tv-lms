import { Component, OnInit, HostListener } from '@angular/core';
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
  isSaving = false;
  isDeleting = false;
  isSaved = false;

  constructor(private archiveService: ArchiveService) {}

  ngOnInit() {
    this.loadArchives();
  }

  loadArchives() {
    this.archiveService.getArchives().subscribe({
      next: (data: Archive[]) => {
        this.archives = data.sort((a, b) => (b.id || 0) - (a.id || 0));
      },
      error: (err: any) => console.error('Error loading archives', err)
    });
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    if (this.showAddForm && !this.isSaving && !this.isSaved) {
      if (this.newArchiveTitle.trim() && this.newArchiveUrl.trim()) {
        event.preventDefault();
        this.saveArchive();
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

  openEditForm(archive: Archive) {
    this.editingArchiveId = archive.id!;
    this.newArchiveTitle = archive.title;
    this.newArchiveUrl = archive.url;
    this.showAddForm = true;
  }

  saveArchive() {
    if (this.newArchiveTitle.trim() && this.newArchiveUrl.trim()) {
      this.isSaving = true;
      this.isSaved = false;
      if (this.editingArchiveId) {
        // Edit mode
        const updatedArchive: Archive = {
          title: this.newArchiveTitle,
          url: this.newArchiveUrl
        };
        
        this.archiveService.updateArchive(this.editingArchiveId, updatedArchive).subscribe({
          next: () => {
            this.loadArchives();
            this.isSaving = false;
            this.isSaved = true;
            setTimeout(() => {
              this.toggleAddForm();
              this.isSaved = false;
            }, 1000);
          },
          error: (err: any) => {
            console.error('Error updating archive video', err);
            this.isSaving = false;
          }
        });
      } else {
        // Add mode
        const newArchive: Archive = {
          title: this.newArchiveTitle,
          url: this.newArchiveUrl
        };
        
        this.archiveService.addArchive(newArchive).subscribe({
          next: (savedArchive: Archive) => {
            this.archives.unshift(savedArchive);
            this.isSaving = false;
            this.isSaved = true;
            setTimeout(() => {
              this.toggleAddForm();
              this.isSaved = false;
            }, 1000);
          },
          error: (err: any) => {
            console.error('Error adding archive video', err);
            this.isSaving = false;
          }
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
      this.isDeleting = true;
      this.isSaved = false;
      this.archiveService.deleteArchive(this.deletingArchiveId).subscribe({
        next: () => {
          this.archives = this.archives.filter(a => a.id !== this.deletingArchiveId);
          this.isDeleting = false;
          this.isSaved = true;
          setTimeout(() => {
            this.cancelDelete();
            this.isSaved = false;
          }, 1000);
        },
        error: (err: any) => {
          console.error('Error deleting archive video', err);
          this.isDeleting = false;
        }
      });
    }
  }
  
  resetForm() {
    this.editingArchiveId = null;
    this.newArchiveTitle = '';
    this.newArchiveUrl = '';
  }
}
