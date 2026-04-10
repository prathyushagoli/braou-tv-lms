import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgrammeService, Programme } from '../../../services/programme.service';
import { HttpClientModule } from '@angular/common/http';
import { SearchFilterPipe } from '../../../pipes/search-filter.pipe';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';

@Component({
  selector: 'app-programmes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SearchFilterPipe, AutoFocusDirective],
  templateUrl: './programmes.component.html',
  styleUrls: ['./programmes.component.css']
})
export class ProgrammesComponent implements OnInit {
  programmes: Programme[] = [];
  
  showAddForm = false;
  showDeleteConfirm = false;
  activeTab = 'Academic Discussions';
  
  editingProgrammeId: number | null = null;
  deletingProgrammeId: number | null = null;
  dropdownOpen = false;
  
  newProgrammeTitle = '';
  newProgrammeUrl = '';
  newProgrammeType = 'Academic Discussions';
  searchType = '';

  tabs = ['Academic Discussions', 'Faculty Interviews', 'Special Lectures', 'Documentary'];

  constructor(private programmeService: ProgrammeService) {}

  ngOnInit() {
    this.loadProgrammes();
  }

  loadProgrammes() {
    this.programmeService.getProgrammes().subscribe({
      next: (data: Programme[]) => {
        this.programmes = data;
      },
      error: (err: any) => console.error('Error loading programmes', err)
    });
  }

  get filteredProgrammes(): Programme[] {
    return this.programmes.filter(p => p.type === this.activeTab);
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

  openEditForm(programme: Programme) {
    this.editingProgrammeId = programme.id!;
    this.newProgrammeTitle = programme.title;
    this.newProgrammeUrl = programme.url;
    this.newProgrammeType = programme.type;
    this.showAddForm = true;
  }

  saveProgramme() {
    if (this.newProgrammeTitle.trim() && this.newProgrammeUrl.trim() && this.newProgrammeType) {
      if (this.editingProgrammeId) {
        // Edit mode
        const updatedProgramme: Programme = {
          title: this.newProgrammeTitle,
          url: this.newProgrammeUrl,
          type: this.newProgrammeType
        };
        
        this.programmeService.updateProgramme(this.editingProgrammeId, updatedProgramme).subscribe({
          next: () => {
            this.loadProgrammes();
            this.toggleAddForm();
          },
          error: (err: any) => console.error('Error updating programme', err)
        });
      } else {
        // Add mode
        const newProgramme: Programme = {
          title: this.newProgrammeTitle,
          url: this.newProgrammeUrl,
          type: this.newProgrammeType
        };
        
        this.programmeService.addProgramme(newProgramme).subscribe({
          next: (savedProgramme: Programme) => {
            this.programmes.push(savedProgramme);
            this.toggleAddForm();
          },
          error: (err: any) => console.error('Error adding programme', err)
        });
      }
    }
  }

  promptDelete(id: number) {
    this.deletingProgrammeId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.deletingProgrammeId = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete() {
    if (this.deletingProgrammeId) {
      this.programmeService.deleteProgramme(this.deletingProgrammeId).subscribe({
        next: () => {
          this.programmes = this.programmes.filter(p => p.id !== this.deletingProgrammeId);
          this.cancelDelete();
        },
        error: (err: any) => console.error('Error deleting programme', err)
      });
    }
  }
  
  resetForm() {
    this.editingProgrammeId = null;
    this.newProgrammeTitle = '';
    this.newProgrammeUrl = '';
    this.newProgrammeType = this.activeTab; // default to the current tab
    this.searchType = '';
    this.dropdownOpen = false;
  }
}
