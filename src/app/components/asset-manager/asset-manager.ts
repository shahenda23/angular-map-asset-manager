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
  }

  onSearch(searchTerm: string) {
    this.searchTerm$.next(searchTerm);
  }

  clearSearch() {
    this.searchTerm$.next('');
  }

  public refreshList() {
    this.locationService.getAllLocations().subscribe();
  }

  feedbackMessage: { text: string, type: 'success' | 'error' } | null = null;

  private showMessage(text: string, type: 'success' | 'error') {
    this.feedbackMessage = { text, type };
    setTimeout(() => this.feedbackMessage = null, 3000); 
  }

  saveAsset() {
    if (this.assetForm.invalid) {
      this.showMessage('Please fill in all required fields correctly.', 'error');
      return;
    }
    const payload: any = {
      name: this.assetForm.value.name,
      description: this.assetForm.value.description,
      latitude: parseFloat(this.assetForm.value.latitude),
      longitude: parseFloat(this.assetForm.value.longitude)
    };

    if (this.editingId) {
      payload.id = this.editingId;
      
      this.locationService.updateLocation(this.editingId, payload).subscribe({
        next: () => {
          this.showMessage('Location updated successfully!', 'success');
          this.resetForm();
          this.onDataChanged.emit();
        },
        error: (error) => {
          console.error('Update error:', error);
          this.showMessage('Failed to update location.', 'error');
        }
      });
    } else {
      this.locationService.createLocation(payload).subscribe({
        next: (res) => {
          this.showMessage('Location created successfully!', 'success');
          this.resetForm();
          this.refreshList();
          this.onDataChanged.emit();
        },
        error: (err) => {
          console.error('Create error:', err);
          this.showMessage('Failed to create location.', 'error');
        }
      });
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
    console.log('deleteLocation called with ID:', id, 'Type:', typeof id);
    this.deleteLocationId = id;
    this.confirmDialog.isVisible = true;
  }

  onDeleteConfirmed() {
    if (this.deleteLocationId) {
      console.log('Confirming delete for ID:', this.deleteLocationId);
      this.locationService.deleteLocation(this.deleteLocationId).subscribe({
        next: () => {
          console.log('Delete completed, emitting onDataChanged');
          this.onDataChanged.emit();
          this.deleteLocationId = null;
        },
        error: (err) => {
          console.error('Error deleting location:', err);
          alert(
            `Failed to delete location: ${err.error?.message ||
            err.message ||
            'Unknown error'}`
          );
          this.deleteLocationId = null;
        }
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