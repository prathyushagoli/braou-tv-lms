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
  isSaving = false;
  isSaved = false;

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.contactService.getContact().subscribe({
      next: (data) => {
        if (data) this.contactObj = data;
      },
      error: (err) => console.error('Error fetching contact', err)
    });
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    if (!this.isSaving && !this.isSaved) {
      event.preventDefault();
      this.saveContact();
    }
  }

  saveContact() {
    this.isSaving = true;
    this.isSaved = false;
    
    this.contactService.updateContact(this.contactObj).subscribe({
      next: (data) => {
        this.contactObj = data;
        this.isSaving = false;
        this.isSaved = true;
        setTimeout(() => {
          this.isSaved = false;
        }, 1500);
      },
      error: (err) => {
        console.error('Error updating contact', err);
        this.isSaving = false;
      }
    });
  }
}
