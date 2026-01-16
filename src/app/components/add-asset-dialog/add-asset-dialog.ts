// add-asset-dialog.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-asset-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-asset-dialog.html',
  styleUrl: './add-asset-dialog.scss',
})
export class AddAssetDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() latitude: number = 0;
  @Input() longitude: number = 0;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<any>();

  assetName: string = '';
  assetDesc: string = '';
  errors: any = {};

  handleSubmit() {
    // Validation
    this.errors = {};
    
    if (!this.assetName.trim()) {
      this.errors.name = 'Asset name is required';
      return;
    }

    // Emit the data
    this.onSubmit.emit({
      name: this.assetName.trim(),
      description: this.assetDesc.trim(),
      latitude: this.latitude,
      longitude: this.longitude
    });

    // Reset form
    this.resetForm();
  }

  handleClose() {
    this.resetForm();
    this.onClose.emit();
  }

  resetForm() {
    this.assetName = '';
    this.assetDesc = '';
    this.errors = {};
  }

  onOverlayClick() {
    this.handleClose();
  }

  onDialogClick(event: Event) {
    event.stopPropagation();
  }
}
