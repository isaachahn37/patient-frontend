import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient, PageResp } from '../models/patient';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly base =
    (window as any).__env?.API_BASE || 'https://patientbackend.isaachahn.my.id';

  constructor(private readonly http: HttpClient) {}

  list(
    searchQuery: string,
    page: number,
    size: number,
    sort: string
  ): Observable<PageResp<Patient>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    if (searchQuery?.trim()) {
      params = params.set('search', searchQuery.trim());
    }

    return this.http.get<PageResp<Patient>>(
      `${this.base}/api/v1/patients`,
      { params }
    );
  }

  get(patientId: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.base}/api/v1/patients/${patientId}`);
  }

  create(body: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.base}/api/v1/patients`, body);
  }

  update(patientId: number, body: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.base}/api/v1/patients/${patientId}`, body);
  }

  delete(patientId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/v1/patients/${patientId}`);
  }
}
