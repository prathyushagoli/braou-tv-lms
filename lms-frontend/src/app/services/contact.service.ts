import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Contact {
  name?: string;
  designation?: string;
  email?: string;
  mobile1?: string;
  mobile2?: string;
  launchVideoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) { }

  getContact(): Observable<Contact> {
    return this.http.get<Contact>(this.apiUrl);
  }

  updateContact(contact: Contact): Observable<Contact> {
    return this.http.put<Contact>(this.apiUrl, contact);
  }
}
