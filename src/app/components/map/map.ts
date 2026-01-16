import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';
import Graphic from '@arcgis/core/Graphic';
import { CommonModule } from '@angular/common';
import { AssetManagerComponent } from '../asset-manager/asset-manager';
import { NavbarComponent } from '../navbar/navbar';
import { Subject, takeUntil } from 'rxjs';
import { AddAssetDialogComponent } from '../add-asset-dialog/add-asset-dialog';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, AssetManagerComponent, NavbarComponent, AddAssetDialogComponent],
  templateUrl: './map.html',
  styleUrl: './map.scss'
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  @ViewChild(AssetManagerComponent) sidebar!: AssetManagerComponent;
  private destroy$ = new Subject<void>();

  private view!: MapView;
  private highlightGraphic: Graphic | null = null;
  private clickHandler: any = null;
  public isAddModeActive: boolean = false;

  // ADD THESE THREE LINES:
  public showDialog: boolean = false;
  public dialogLatitude: number = 0;
  public dialogLongitude: number = 0;


  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef
  ) { }

  onLogout() {
    this.authService.logout();
  }

  // Handle location selection from search/filter
  onLocationSelected(location: any) {
    if (location) {
      this.zoomTo(location);
      this.highlightLocation(location);
    }
  }

  ngOnInit(): void {
    const map = new Map({
      basemap: 'streets-vector'
    });

    this.view = new MapView({
      container: this.mapViewEl.nativeElement,
      map: map,
      zoom: 5,
      center: [30.8025, 26.8206] // Longitude, Latitude for Cairo
    });

    this.view.when(() => {
      this.loadPoints();
      // Don't setup click interaction automatically
    });
  }

  ngAfterViewInit(): void {
    this.setupSearchListener();
  }

  // Toggle add mode on/off
  toggleAddMode() {
    this.isAddModeActive = !this.isAddModeActive;

    if (this.isAddModeActive) {
      this.setupClickInteraction();
    } else {
      this.removeClickInteraction();
    }
  }

  // Load all points from .NET
  loadPoints() {
    console.log('MapComponent: loadPoints called');
    this.locationService.getAllLocations().subscribe(
      locations => {
        console.log('MapComponent: Received locations:', locations);
        console.log(`MapComponent: Clearing ${this.view.graphics.length} existing graphics`);
        this.view.graphics.removeAll();

        locations.forEach(loc => {
          console.log(`MapComponent: Adding graphic for location ${loc.id}:`, loc.name);
          this.addGraphic(
            loc.latitude,
            loc.longitude,
            loc.name,
            loc.description,
            loc.id
          );
        });
        console.log(`MapComponent: Finished loading. Now have ${this.view.graphics.length} graphics on map`);
      },
      error => {
        console.error('MapComponent: Error loading locations', error);
      }
    );
  }

  // Listen for location selection from asset manager (search or click)
  setupSearchListener() {
    if (this.sidebar) {
      this.sidebar.onLocationSelect
        .pipe(takeUntil(this.destroy$)) // This automatically unsubscribes
        .subscribe((location: any) => {
          this.zoomTo(location);
          this.highlightLocation(location);
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.clickHandler) {
      this.clickHandler.remove();
    }
  }

  // Zoom to a location
  zoomTo(loc: any) {
    this.view.goTo({
      center: [loc.longitude, loc.latitude],
      zoom: 15
    }, { duration: 1000 });
  }

  // Highlight a location with a special marker
  highlightLocation(loc: any) {
    // Remove existing highlight
    if (this.highlightGraphic) {
      this.view.graphics.remove(this.highlightGraphic);
    }

    // Add highlight marker in gold
    const point = { type: "point", longitude: loc.longitude, latitude: loc.latitude };
    this.highlightGraphic = new Graphic({
      geometry: point as any,
      symbol: {
        type: "simple-marker",
        color: [255, 215, 0], // Gold color for highlight
        size: 20,
        outline: { color: [255, 255, 255], width: 3 }
      } as any,
      attributes: {
        name: loc.name,
        desc: loc.description,
        isHighlight: true
      }
    });

    this.view.graphics.add(this.highlightGraphic);
  }

  setupClickInteraction() {
    // Remove existing handler if any
    if (this.clickHandler) {
      this.clickHandler.remove();
    }

    this.clickHandler = this.view.on("click", (event) => {
      // 1. Capture coordinates from the ESRI map click event
      const lat = event.mapPoint.latitude;
      const lon = event.mapPoint.longitude;

      // Update the values
      this.dialogLatitude = lat;
      this.dialogLongitude = lon;
      this.showDialog = true;

      // 3. Open the dialog component
      this.cdr.detectChanges();

      // 4. Important: Disable add mode so they don't click multiple times 
      // while the dialog is open
      this.isAddModeActive = false;
      this.removeClickInteraction();
    });
  }
  // Remove click interaction
  removeClickInteraction() {
    if (this.clickHandler) {
      this.clickHandler.remove();
      this.clickHandler = null;
    }
  }

  // Handle dialog close
  onDialogClose() {
    this.showDialog = false;
  }

  // Handle dialog submit
  onDialogSubmit(data: any) {
    const newLocation = {
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description
    };

    this.locationService.createLocation(newLocation).subscribe({
      next: (res: any) => {
        const locationId = res?.id || res?.locationId || res;
        this.addGraphic(data.latitude, data.longitude, data.name, data.description, locationId);
        console.log("Asset created successfully");
        this.showDialog = false;
      },
      error: (err) => {
        console.error(err);
        alert("Failed to save asset to database.");
      }
    });
  }

  // Helper to draw markers
  addGraphic(
    lat: number,
    lon: number,
    name: string,
    description: string = '',
    id?: number
  ) {
    const point = { type: "point", longitude: lon, latitude: lat };

    const graphic = new Graphic({
      geometry: point as any,
      symbol: {
        type: "simple-marker",
        color: [226, 119, 40],
        outline: { color: [255, 255, 255], width: 1 }
      } as any,
      attributes: {
        id: id,
        name: name,
        desc: description
      },
      popupTemplate: {
        title: "{name}",
        content: `
          <b>Description:</b> {desc}<br>
          <b>Latitude:</b> ${lat.toFixed(4)}<br>
          <b>Longitude:</b> ${lon.toFixed(4)}
        `
      }
    });

    this.view.graphics.add(graphic);
  }
}