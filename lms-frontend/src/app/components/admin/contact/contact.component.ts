import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact } from '../../../services/contact.service';

@Component({
  selector: 'app-contact-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactObj: Contact = {};
  editObj: Contact = {};
  
  showEditForm = false;
  isSaving = false;
  isSaved = false;
  originalLaunchVideoUrl: string = '';

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.contactService.getContact().subscribe({
      next: (data) => {
        if (data) Object.assign(this.contactObj, data);
        this.originalLaunchVideoUrl = this.contactObj.launchVideoUrl || '';
      },
      error: (err) => console.error('Error fetching contact', err)
    });
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    if (this.showEditForm && !this.isSaving && !this.isSaved) {
      event.preventDefault();
      this.saveContact();
    }
  }

  openEditForm() {
    this.editObj = { ...this.contactObj };
    this.showEditForm = true;
    this.isSaved = false;
    this.isSaving = false;
  }

  closeEditForm() {
    this.showEditForm = false;
  }

  saveContact() {
    this.isSaving = true;
    this.isSaved = false;
    
    this.contactService.updateContact(this.editObj).subscribe({
      next: (data) => {
        this.contactObj = data;
        this.isSaving = false;
        this.isSaved = true;
        setTimeout(() => {
          this.isSaved = false;
          this.closeEditForm();
        }, 1000);
      },
      error: (err) => {
        console.error('Error updating contact', err);
        this.isSaving = false;
      }
    });
  }

  isSavingBanner = false;
  
  saveContactConfigOnly() {
    if (!this.contactObj) return;
    this.isSavingBanner = true;
    
    this.contactService.updateContact(this.contactObj).subscribe({
      next: (data) => {
        this.contactObj = data;
        this.originalLaunchVideoUrl = data.launchVideoUrl || '';
        setTimeout(() => {
          this.isSavingBanner = false;
        }, 700);
      },
      error: (err) => {
        console.error('Error updating launch configuration', err);
        this.isSavingBanner = false;
      }
    });
  }
}
