import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PropertyFormComponent, PropertyFormValue } from '../property-form/property-form.component';

@Component({
  selector: 'app-property-creator-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    PropertyFormComponent,
  ],
  templateUrl: './property-creator-dialog.component.html',
  styleUrls: ['./property-creator-dialog.component.scss'],
})
export class PropertyCreatorDialogComponent {
  formValue: PropertyFormValue | null = null;
  isFormValid = false;

  constructor(private dialogRef: MatDialogRef<PropertyCreatorDialogComponent>) {}

  onFormChange(value: PropertyFormValue): void {
    this.formValue = value;
  }

  onValidChange(valid: boolean): void {
    this.isFormValid = valid;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.isFormValid || !this.formValue) return;

    const result: any = {
      name: this.formValue.name,
      type: this.formValue.type,
    };
    if (this.formValue.type === 'Select') {
      result.isMultiSelect = this.formValue.isMultiSelect;
      result.selectOptions = this.formValue.selectOptions.map((opt, i) => ({
        name: opt.name,
        color: opt.color,
        order: i,
      }));
    }
    this.dialogRef.close(result);
  }
}
