import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Archive {
  id?: number;
  title: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArchiveService {
  private apiUrl = `${environment.apiUrl}/archives`;

  constructor(private http: HttpClient) { }

  getArchives(): Observable<Archive[]> {
    return this.http.get<Archive[]>(this.apiUrl);
  }

  addArchive(archive: Archive): Observable<Archive> {
    return this.http.post<Archive>(this.apiUrl, archive);
  }

  updateArchive(id: number, archive: Archive): Observable<Archive> {
    return this.http.put<Archive>(`${this.apiUrl}/${id}`, archive);
  }

  deleteArchive(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
