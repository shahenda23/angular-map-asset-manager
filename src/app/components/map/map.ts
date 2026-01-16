// import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import Map from '@arcgis/core/Map';
// import MapView from '@arcgis/core/views/MapView';
// import { AuthService } from '../../services/auth.service';
// import { LocationService } from '../../services/location.service';
// import Graphic from '@arcgis/core/Graphic';
// import { CommonModule } from '@angular/common';
// import { AssetManagerComponent } from '../asset-manager/asset-manager';
// import { NavbarComponent } from '../navbar/navbar';

// @Component({
//   selector: 'app-map',
//   standalone: true,
//   imports: [CommonModule, AssetManagerComponent, NavbarComponent],
//   templateUrl: './map.html',
//   styleUrl: './map.scss'
// })
// export class MapComponent implements OnInit {
//   @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
//   @ViewChild(AssetManagerComponent) sidebar!: AssetManagerComponent;

//   private view!: MapView;
//   private highlightGraphic: Graphic | null = null;

//   constructor(
//     private authService: AuthService,
//     private locationService: LocationService
//   ) { }

//   onLogout() {
//     this.authService.logout();
//   }

//   // Handle location selection from search/filter
//   onLocationSelected(location: any) {
//     if (location) {
//       this.zoomTo(location);
//       this.highlightLocation(location);
//     }
//   }

//   ngOnInit(): void {
//     const map = new Map({
//       basemap: 'streets-vector'
//     });

//     this.view = new MapView({
//       container: this.mapViewEl.nativeElement,
//       map: map,
//       zoom: 10,
//       center: [31.2357, 30.0444] // Longitude, Latitude for Cairo
//     });

//     this.view.when(() => {
//       this.loadPoints();
//       this.setupClickInteraction();
//       // this.setupSearchListener();
//     });


//   }

//   ngAfterViewInit(): void {
//   this.setupSearchListener();
// }
//   // Load all points from .NET
//   loadPoints() {
//     this.locationService.getAllLocations().subscribe(locations => {
//       this.view.graphics.removeAll();
//       locations.forEach(loc => this.addGraphic(loc.latitude, loc.longitude, loc.name, loc.description));
//     });
//   }

//   // Listen for location selection from asset manager (search or click)
//   setupSearchListener() {
//     if (this.sidebar) {
//       this.sidebar.onLocationSelect.subscribe((location: any) => {
//         this.zoomTo(location);
//         // Highlight the selected location
//         this.highlightLocation(location);
//       });
//     }
//   }

//   // Zoom to a location
//   zoomTo(loc: any) {
//     this.view.goTo({
//       center: [loc.longitude, loc.latitude],
//       zoom: 15
//     }, { duration: 1000 });
//   }

//   // Highlight a location with a special marker
//   highlightLocation(loc: any) {
//     // Remove existing highlight
//     if (this.highlightGraphic) {
//       this.view.graphics.remove(this.highlightGraphic);
//     }

//     // Add highlight marker in gold
//     const point = { type: "point", longitude: loc.longitude, latitude: loc.latitude };
//     this.highlightGraphic = new Graphic({
//       geometry: point as any,
//       symbol: {
//         type: "simple-marker",
//         color: [255, 215, 0], // Gold color for highlight
//         size: 20,
//         outline: { color: [255, 255, 255], width: 3 }
//       } as any,
//       attributes: {
//         name: loc.name,
//         desc: loc.description,
//         isHighlight: true
//       }
//     });

//     this.view.graphics.add(this.highlightGraphic);
//   }

//   // Click to create a new point
//   setupClickInteraction() {
//     this.view.on("click", (event) => {
//       const lat = event.mapPoint.latitude;
//       const lon = event.mapPoint.longitude;

//       const assetName = prompt("Enter Name for this Asset:");
//       const assetDesc = prompt("Enter Description:");

//       if (assetName) {
//         const newLocation = {
//           name: assetName,
//           latitude: lat,
//           longitude: lon,
//           description: assetDesc ?? ''
//         };

//         this.locationService.createLocation(newLocation).subscribe({
//           next: (res) => {
//             this.addGraphic(lat, lon, assetName, assetDesc ?? '');
//             console.log("Asset created successfully");
//           },
//           error: (err) => alert("Failed to save asset to database.")
//         });
//       }
//     });
//   }

//   // Helper to draw markers
//   addGraphic(lat: number, lon: number, name: string, description: string = '') {
//     const point = { type: "point", longitude: lon, latitude: lat };

//     const graphic = new Graphic({
//       geometry: point as any,
//       symbol: {
//         type: "simple-marker",
//         color: [226, 119, 40],
//         outline: { color: [255, 255, 255], width: 1 }
//       } as any,
//       attributes: {
//         name: name,
//         desc: description
//       },
//       popupTemplate: {
//         title: "{name}",
//         content: `
//           <b>Description:</b> {desc}<br>
//           <b>Latitude:</b> ${lat.toFixed(4)}<br>
//           <b>Longitude:</b> ${lon.toFixed(4)}
//         `
//       }
//     });

//     this.view.graphics.add(graphic);
//   }
// }
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';
import Graphic from '@arcgis/core/Graphic';
import { CommonModule } from '@angular/common';
import { AssetManagerComponent } from '../asset-manager/asset-manager';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, AssetManagerComponent, NavbarComponent],
  templateUrl: './map.html',
  styleUrl: './map.scss'
})
export class MapComponent implements OnInit {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  @ViewChild(AssetManagerComponent) sidebar!: AssetManagerComponent;

  private view!: MapView;
  private highlightGraphic: Graphic | null = null;
  private clickHandler: any = null; // Store the click handler reference
  public isAddModeActive: boolean = false; // Track if add mode is active

  constructor(
    private authService: AuthService,
    private locationService: LocationService
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
      zoom: 10,
      center: [31.2357, 30.0444] // Longitude, Latitude for Cairo
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
    this.locationService.getAllLocations().subscribe(locations => {
      // this.view.graphics.removeAll();
      locations.forEach(loc => this.addGraphic(loc.latitude, loc.longitude, loc.name, loc.description));
    });
  }

  // Listen for location selection from asset manager (search or click)
  setupSearchListener() {
    if (this.sidebar) {
      this.sidebar.onLocationSelect.subscribe((location: any) => {
        this.zoomTo(location);
        // Highlight the selected location
        this.highlightLocation(location);
      });
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

  // Click to create a new point
  setupClickInteraction() {
    // Remove existing handler if any
    if (this.clickHandler) {
      this.clickHandler.remove();
    }

    this.clickHandler = this.view.on("click", (event) => {
      const lat = event.mapPoint.latitude;
      const lon = event.mapPoint.longitude;

      const assetName = prompt("Enter Name for this Asset:");
      const assetDesc = prompt("Enter Description:");

      if (assetName) {
        const newLocation = {
          name: assetName,
          latitude: lat,
          longitude: lon,
          description: assetDesc ?? ''
        };

        this.locationService.createLocation(newLocation).subscribe({
          next: (res) => {
            this.addGraphic(lat, lon, assetName, assetDesc ?? '');
            console.log("Asset created successfully");
          },
          error: (err) => alert("Failed to save asset to database.")
        });
      }
    });
  }

  // Remove click interaction
  removeClickInteraction() {
    if (this.clickHandler) {
      this.clickHandler.remove();
      this.clickHandler = null;
    }
  }

  // Helper to draw markers
  addGraphic(lat: number, lon: number, name: string, description: string = '') {
    const point = { type: "point", longitude: lon, latitude: lat };

    const graphic = new Graphic({
      geometry: point as any,
      symbol: {
        type: "simple-marker",
        color: [226, 119, 40],
        outline: { color: [255, 255, 255], width: 1 }
      } as any,
      attributes: {
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