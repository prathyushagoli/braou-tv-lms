import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Schedule {
  id?: number;
  title: string;
  fileName?: string;
  createdAt?: string; // Standard ISO date string format
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) { }

  getSchedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(this.apiUrl);
  }

  addSchedule(title: string, file: File): Observable<Schedule> {
    const formData = new FormData();
    formData.append('title', title);
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<Schedule>(this.apiUrl, formData);
  }

  updateSchedule(id: number, title: string, file: File | null): Observable<Schedule> {
    const formData = new FormData();
    formData.append('title', title);
    if (file) {
      formData.append('file', file);
    }
    return this.http.put<Schedule>(`${this.apiUrl}/${id}`, formData);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
