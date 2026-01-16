import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';


function latitudeValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const lat = parseFloat(value);
  if (isNaN(lat)) return { invalidLatitude: true };
  if (lat < -90 || lat > 90) return { latitudeRange: true };
  return null;
}

function longitudeValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const lon = parseFloat(value);
  if (isNaN(lon)) return { invalidLongitude: true };
  if (lon < -180 || lon > 180) return { longitudeRange: true };
  return null;
}


@Component({
  selector: 'app-asset-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './asset-manager.html',
  styleUrl: './asset-manager.scss'
})
export class AssetManagerComponent implements OnInit {
  @Output() onLocationSelect = new EventEmitter<any>();
  @Output() onDataChanged = new EventEmitter<void>();
  @ViewChild(ConfirmationDialogComponent) confirmDialog!: ConfirmationDialogComponent;

  locations$: any;
  filteredLocations$: any;
  searchTerm$ = new BehaviorSubject<string>('');
  assetForm: FormGroup;
  editingId: number | null = null;
  deleteLocationId: number | null = null;

  constructor(private locationService: LocationService, private fb: FormBuilder) {
    this.locations$ = this.locationService.locations$;

    // Create filtered locations observable that combines locations and search term
    this.filteredLocations$ = combineLatest([
      this.locations$ as any,
      this.searchTerm$ as any
    ]).pipe(
      map(([locations, searchTerm]: any) => {
        if (!searchTerm || !searchTerm.trim()) {
          return locations;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return locations.filter((loc: any) =>
          loc.name.toLowerCase().includes(lowerSearchTerm)
        );
      })
    );

    this.assetForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      latitude: ['', [Validators.required, latitudeValidator]],
      longitude: ['', [Validators.required, longitudeValidator]]
    });
  }

  get nameControl(): FormControl {
    return this.assetForm.get('name') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.assetForm.get('description') as FormControl;
  }

  get latitudeControl(): FormControl {
    return this.assetForm.get('latitude') as FormControl;
  }

  get longitudeControl(): FormControl {
    return this.assetForm.get('longitude') as FormControl;
  }

  ngOnInit() {
    // Data loads automatically from service
  }

  onSearch(searchTerm: string) {
    this.searchTerm$.next(searchTerm);
  }

  clearSearch() {
    this.searchTerm$.next('');
  }

  // Map calls this to update the list after a click-add
  public refreshList() {
    this.locationService.getAllLocations().subscribe();
  }

  saveAsset() {
    if (!this.assetForm.valid) return;

    const formValue = this.assetForm.value;
    const payload = {
      id: this.editingId || undefined,
      name: formValue.name,
      description: formValue.description || '',
      latitude: parseFloat(formValue.latitude),
      longitude: parseFloat(formValue.longitude)
    };

    if (this.editingId) {
      // Update existing location
      console.log('Updating location with ID:', this.editingId, 'Payload:', payload);
      this.locationService.updateLocation(this.editingId, payload).subscribe(
        (response) => {
          console.log('Update successful:', response);
          this.resetForm();
          this.onDataChanged.emit();
        },
        (error) => {
          console.error('Error updating location:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error response:', error.error);
          alert(`Failed to update location: ${error.error?.message || error.message || 'Unknown error'}`);
        }
      );
    } else {
      // Create new location
      console.log('Creating new location with payload:', payload);
      this.locationService.createLocation(payload).subscribe(
        (response) => {
          console.log('Create successful:', response);
          this.refreshList();
          this.onDataChanged.emit();
          this.resetForm();
        },
        (error) => {
          console.error('Error creating location:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error response:', error.error);
          alert(`Failed to create location: ${error.error?.message || error.message || 'Unknown error'}`);
        }
      );
    }
  }

  editLocation(loc: any) {
    this.editingId = loc.id;
    this.assetForm.patchValue({
      name: loc.name,
      description: loc.description,
      latitude: loc.latitude,
      longitude: loc.longitude
    });
  }

  deleteLocation(id: number, event: Event) {
    event.stopPropagation();
    this.deleteLocationId = id;
    this.confirmDialog.isVisible = true;
  }

  onDeleteConfirmed() {
    if (this.deleteLocationId) {
      this.locationService.deleteLocation(this.deleteLocationId).subscribe(() => {
        this.onDataChanged.emit();
        this.deleteLocationId = null;
      });
    }
  }

  onDeleteCancelled() {
    this.deleteLocationId = null;
  }

  resetForm() {
    this.editingId = null;
    this.assetForm.reset();
  }

  selectLocation(loc: any) {
    this.onLocationSelect.emit(loc);
  }
}