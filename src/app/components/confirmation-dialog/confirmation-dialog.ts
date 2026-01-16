import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirmation-dialog.html',
    styleUrl: './confirmation-dialog.scss'
})
export class ConfirmationDialogComponent {
    @Input() isVisible = false;
    @Input() title = 'Confirm';
    @Input() message = 'Are you sure?';
    @Input() confirmButtonText = 'Delete';
    @Input() cancelButtonText = 'Cancel';
    @Output() confirmed = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    onConfirm() {
        this.confirmed.emit();
        this.isVisible = false;
    }

    onCancel() {
        this.cancelled.emit();
        this.isVisible = false;
    }
}
