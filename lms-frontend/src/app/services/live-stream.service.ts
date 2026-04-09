import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LiveStream {
  id?: number;
  name: string;
  url: string;
  category: string;
  live: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LiveStreamService {
  private apiUrl = `${environment.apiUrl}/live-streams`;

  constructor(private http: HttpClient) { }

  getStreams(): Observable<LiveStream[]> {
    return this.http.get<LiveStream[]>(this.apiUrl);
  }

  addStream(stream: LiveStream): Observable<LiveStream> {
    return this.http.post<LiveStream>(this.apiUrl, stream);
  }

  deleteStream(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStream(id: number, stream: LiveStream): Observable<LiveStream> {
    return this.http.put<LiveStream>(`${this.apiUrl}/${id}`, stream);
  }

  updateLiveStatus(id: number, isLive: boolean): Observable<LiveStream> {
    return this.http.put<LiveStream>(`${this.apiUrl}/${id}/live-status?isLive=${isLive}`, {});
  }
}
