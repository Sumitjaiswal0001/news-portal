import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConstantData } from './constant-data';
import { Newsletter } from '../models/newsletter.model';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private readonly apiUrl: string = ConstantData.getApiUrl() + 'Newsletter/';

  constructor(private http: HttpClient) {}

  // 1. Get Previous 10 Days Newsletters (Front Website)
  getRecentTenDays(): Observable<{ success: boolean; data: Newsletter[] }> {
    return this.http.get<{ success: boolean; data: Newsletter[] }>(this.apiUrl + 'GetRecentTenDays');
  }

  // 2. Get Current Month Newsletters (View All)
  getCurrentMonth(year?: number, month?: number): Observable<{ success: boolean; data: Newsletter[]; month: number; year: number; monthName: string }> {
    let url = this.apiUrl + 'GetCurrentMonth';
    if (year && month) {
      url += `?year=${year}&month=${month}`;
    }
    return this.http.get<any>(url);
  }

  // 3. Search / Filter by Date
  getByDate(date: string): Observable<{ success: boolean; data: Newsletter[] }> {
    return this.http.get<{ success: boolean; data: Newsletter[] }>(`${this.apiUrl}GetByDate?date=${date}`);
  }

  // 4. Admin: Get all newsletters
  getAdminList(): Observable<{ success: boolean; data: Newsletter[] }> {
    return this.http.get<{ success: boolean; data: Newsletter[] }>(this.apiUrl + 'GetAdminList');
  }

  // 5. Admin: Upload newsletter (FormData)
  uploadNewsletter(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'UploadNewsletter', formData);
  }

  // 6. Admin: Delete newsletter
  deleteNewsletter(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}DeleteNewsletter/${id}`, {});
  }
}
