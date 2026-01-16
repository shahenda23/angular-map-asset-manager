import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
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

  getAllLocations(): Observable<AssetLocation[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<AssetLocation[]>(this.apiUrl, { headers }).pipe(
      tap(data => this.locationsSubject.next(data))
    );
  }

  createLocation(location: AssetLocation): Observable<AssetLocation> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(
      '[LocationService] Creating new location:',
      location
    );
    return this.http.post<AssetLocation>(this.apiUrl, location, { headers }).pipe(
      tap(newLocation => {
        console.log(
          '[LocationService] Create response received:',
          newLocation
        );
        console.log(
          `[LocationService] New location ID from response: ${newLocation.id}`
        );
        if (!newLocation.id) {
          console.log(
            '[LocationService] No ID in response, will refresh from server'
          );
        } else {
          const currentLocations = this.locationsSubject.value;
          const updated = [...currentLocations, newLocation];
          console.log(
            `[LocationService] Updated locations array (count: ${updated.length}):`,
            updated
          );
          this.locationsSubject.next(updated);
        }
      }),
      switchMap(newLocation => {
        console.log('[LocationService] Refreshing locations after create');
        return this.getAllLocations().pipe(
          switchMap(allLocations => {
            
            const createdItem = allLocations.find(
              loc =>
                loc.name === newLocation.name &&
                loc.latitude === newLocation.latitude &&
                loc.longitude === newLocation.longitude
            );
            console.log(
              '[LocationService] Found created item with ID:',
              createdItem?.id
            );
            return [createdItem || newLocation];
          })
        );
      })
    );
  }

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


  deleteLocation(id: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(`[LocationService] Deleting location with ID: ${id}`);
    console.log(
      `[LocationService] Current locations BEFORE delete:`,
      this.locationsSubject.value
    );

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap({
        next: () => {
          console.log(`[LocationService] Delete HTTP successful for ID: ${id}`);
          console.log(
            `[LocationService] Current locations before refresh:`,
            this.locationsSubject.value
          );
        },
        error: (err) => {
          console.error(`[LocationService] Delete HTTP failed for ID: ${id}`, err);
        }
      }),
      switchMap(() => {
        console.log(
          `[LocationService] Fetching fresh locations from backend after delete`
        );
        return this.http.get<AssetLocation[]>(this.apiUrl, { headers }).pipe(
          tap(data => {
            console.log(
              `[LocationService] Received ${data.length} locations from server`
            );
            console.log(`[LocationService] New data:`, data);
            this.locationsSubject.next(data);
          })
        );
      }),
      switchMap(() => {
        return new Observable<void>(observer => {
          console.log(
            `[LocationService] Observable chain complete, notifying subscribers`
          );
          observer.next();
          observer.complete();
        });
      })
    );
  }
}