import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

export interface PointData {
  name: string;
  description: string;
}

@Component({
  selector: 'app-add-point-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-point-dialog.html',
  styleUrl: './add-point-dialog.scss'
})
export class AddPointDialogComponent {
  @Output() confirmed = new EventEmitter<PointData>();
  @Output() cancelled = new EventEmitter<void>();

  isVisible: boolean = false;
  latitude: number = 0;
  longitude: number = 0;
  pointForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.pointForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  get nameControl(): FormControl {
    return this.pointForm.get('name') as FormControl;
  }

  open(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.pointForm.reset();
    this.isVisible = true;
  }

  onConfirm() {
    if (this.pointForm.valid) {
      const pointData: PointData = {
        name: this.pointForm.value.name,
        description: this.pointForm.value.description || ''
      };
      this.confirmed.emit(pointData);
      this.isVisible = false;
    }
  }

  onCancel() {
    this.cancelled.emit();
    this.isVisible = false;
    this.pointForm.reset();
  }
}