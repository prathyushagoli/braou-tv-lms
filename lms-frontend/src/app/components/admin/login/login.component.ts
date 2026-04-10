import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class AdminLoginComponent {
  currentView: 'LOGIN' | 'FORGOT' | 'RESET' = 'LOGIN';

  email = '';
  password = '';

  otp = '';
  newPassword = '';

  showLoginPassword = false;
  showResetPassword = false;

  isLoading = false;
  message = '';
  isError = false;

  constructor(private router: Router, private http: HttpClient) { }

  onSignIn() {
    if (!this.email || !this.password) {
      this.showMessage('Please enter email and password', true);
      return;
    }

    this.isLoading = true;
    this.http.post<any>(`${environment.apiUrl}/auth/login`, { email: this.email, password: this.password })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            localStorage.setItem('isAdminLoggedIn', 'true');
            this.router.navigate(['/admin/live-stream']);
          } else {
            this.showMessage(res.message || 'Invalid Credentials', true);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showMessage(err.error?.message || 'Invalid Credentials', true);
        }
      });
  }

  onForgotPassword() {
    if (!this.email) {
      this.showMessage('Please enter your email first to receive the OTP reset link', true);
      return;
    }

    this.isLoading = true;
    this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, { email: this.email })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.showMessage('OTP sent to your email', false);
            if (res.otp) {
              console.log("MOCK DEV OTP RECEIVED NATIVELY INTERNALLY:", res.otp);
            }
            this.currentView = 'RESET';
          } else {
            this.showMessage(res.message, true);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showMessage('Error requesting password reset automatically', true);
        }
      });
  }

  onResetPassword() {
    if (!this.email || !this.otp || !this.newPassword) {
      this.showMessage('Please boldly fill all explicit bounds', true);
      return;
    }

    this.isLoading = true;
    this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, {
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.showMessage('Password explicitly reset optimally! You may now securely login.', false);
          this.currentView = 'LOGIN';
          this.password = '';
          this.newPassword = '';
          this.otp = '';
        } else {
          this.showMessage(res.message, true);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showMessage(err.error?.message || 'Invalid or Expired OTP structurally', true);
      }
    });
  }

  switchToLogin() {
    this.currentView = 'LOGIN';
    this.message = '';
  }

  switchToForgot() {
    this.currentView = 'FORGOT';
    this.message = '';
  }

  showMessage(msg: string, isErr: boolean) {
    this.message = msg;
    this.isError = isErr;
    setTimeout(() => this.message = '', 6000);
  }
}
