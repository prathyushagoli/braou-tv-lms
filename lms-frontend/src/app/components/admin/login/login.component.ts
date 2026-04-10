import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class AdminLoginComponent {
  email = '';
  password = '';

  constructor(private router: Router) {}

  onSignIn() {
    if (this.email === 'braoutv@braou.ac.in' && this.password === 'Braou@234') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      this.router.navigate(['/admin/live-stream']);
    } else {
      alert('Invalid Administrator Credentials!');
    }
  }
}
