import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContactService, Contact } from '../../../services/contact.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css']
})
export class UserLayoutComponent implements OnInit {
  contactObj: Contact | null = null;
  isMobileMenuOpen = false;

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.contactService.getContact().subscribe({
      next: (data) => {
        this.contactObj = data;
      },
      error: (err) => console.error('Error fetching contact', err)
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
