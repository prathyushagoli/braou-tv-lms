import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Programme {
  id?: number;
  title: string;
  url: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgrammeService {
  private apiUrl = `${environment.apiUrl}/programmes`;

  constructor(private http: HttpClient) { }

  getProgrammes(): Observable<Programme[]> {
    return this.http.get<Programme[]>(this.apiUrl);
  }

  addProgramme(programme: Programme): Observable<Programme> {
    return this.http.post<Programme>(this.apiUrl, programme);
  }

  updateProgramme(id: number, programme: Programme): Observable<Programme> {
    return this.http.put<Programme>(`${this.apiUrl}/${id}`, programme);
  }

  deleteProgramme(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
