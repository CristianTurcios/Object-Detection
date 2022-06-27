import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetectionService {

  constructor(
    private http: HttpClient,
  ) { }

  getPredictions(data: any): Observable<any> {
    const url = `${environment.apiUrl}/detection`;
    return this.http.post(url, data);
  }
}
