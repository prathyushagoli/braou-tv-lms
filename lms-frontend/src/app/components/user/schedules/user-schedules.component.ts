import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ScheduleService, Schedule } from '../../../services/schedule.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-schedules',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe], // Needed to inject for custom suffix formatting if necessary
  templateUrl: './user-schedules.component.html',
  styleUrls: ['./user-schedules.component.css']
})
export class UserSchedulesComponent implements OnInit {
  schedules: Schedule[] = [];
  private backendUrl = `${environment.apiUrl}/schedules/files/`;

  constructor(
    private scheduleService: ScheduleService,
    private datePipe: DatePipe,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.scheduleService.getSchedules().subscribe({
      next: (data: Schedule[]) => {
        this.schedules = data;
      },
      error: (err: any) => console.error('Error fetching schedules', err)
    });
  }
  
  // Custom date formatting for "April 9th, 2026" format
  formatDate(isoDate: string | undefined): string {
    if (!isoDate) return 'Unknown Date';
    
    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime())) return isoDate; // Fallback if invalid
    
    const month = this.datePipe.transform(dateObj, 'MMMM');
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    
    // Add suffix logic
    let suffix = 'th';
    if (day % 10 === 1 && day !== 11) suffix = 'st';
    else if (day % 10 === 2 && day !== 12) suffix = 'nd';
    else if (day % 10 === 3 && day !== 13) suffix = 'rd';
    
    return `${month} ${day}${suffix}, ${year}`;
  }

  getFileUrl(fileName: string | undefined): string {
    if (!fileName) return '#';
    return `${this.backendUrl}${fileName}`;
  }
  
  getSafeUrl(fileName: string | undefined): SafeResourceUrl {
    const fileUrl = this.getFileUrl(fileName);
    if (fileUrl === '#') return this.sanitizer.bypassSecurityTrustResourceUrl('#');
    return this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl + '#toolbar=0&navpanes=0&scrollbar=0');
  }

  previewFile(fileName: string | undefined) {
    if (fileName) {
      const url = this.getFileUrl(fileName);
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

  downloadFile(event: Event, fileName: string | undefined) {
    event.stopPropagation(); // Prevents the card click trigger
    if (fileName) {
      const url = this.getFileUrl(fileName);
      
      // Fetch as strict blob to bypass cross-origin browser opening constraints
      this.http.get(url, { responseType: 'blob' }).subscribe({
        next: (blob: Blob) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = fileName; // Forces browser direct-download
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(downloadUrl);
        },
        error: (err) => console.error('Error attempting direct download', err)
      });
    }
  }
}
