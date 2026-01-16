import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AssetLocation } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private apiUrl = `${environment.apiUrl}/Locations`;
  private locationsSubject = new BehaviorSubject<AssetLocation[]>([]);
  public locations$ = this.locationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialLocations();
  }

  private loadInitialLocations() {
    this.getAllLocations().subscribe(
      data => this.locationsSubject.next(data),
      error => console.error('Error loading locations:', error)
    );
  }

  // 1. Get all points from .NET
  getAllLocations(): Observable<AssetLocation[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<AssetLocation[]>(this.apiUrl, { headers }).pipe(
      tap(data => this.locationsSubject.next(data))
    );
  }

  // 2. Save a new point to .NET
  createLocation(location: AssetLocation): Observable<AssetLocation> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<AssetLocation>(this.apiUrl, location, { headers }).pipe(
      tap(newLocation => {
        const currentLocations = this.locationsSubject.value;
        this.locationsSubject.next([...currentLocations, newLocation]);
      })
    );
  }

  // 3. Update an existing point
  updateLocation(id: number, location: AssetLocation): Observable<AssetLocation> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    console.log(`Making PUT request to ${this.apiUrl}/${id} with data:`, location);

    return this.http.put<AssetLocation>(`${this.apiUrl}/${id}`, location, { headers }).pipe(
      tap(updatedLocation => {
        console.log('Update response:', updatedLocation);
        const currentLocations = this.locationsSubject.value;
        const index = currentLocations.findIndex(loc => loc.id === id);
        if (index !== -1) {
          currentLocations[index] = updatedLocation;
          this.locationsSubject.next([...currentLocations]);
        }
      })
    );
  }

  // 4. Delete a point
  deleteLocation(id: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(() => {
        const currentLocations = this.locationsSubject.value;
        this.locationsSubject.next(currentLocations.filter(loc => loc.id !== id));
      })
    );
  }
}