import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FieldPropertyType } from 'src/app/core/models/field-property.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-property-creator-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './property-creator-dialog.component.html',
  styleUrls: ['./property-creator-dialog.component.scss'],
})
export class PropertyCreatorDialogComponent {
  FieldPropertyType = FieldPropertyType;

  propertyForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl<FieldPropertyType>(FieldPropertyType.Text, [Validators.required]),
  });

  propertyTypes = [
    { value: FieldPropertyType.Text, label: 'Text', icon: 'text_fields' },
    { value: FieldPropertyType.Boolean, label: 'Boolean', icon: 'check_box' },
    { value: FieldPropertyType.Date, label: 'Date', icon: 'calendar_today' },
  ];

  constructor(private dialogRef: MatDialogRef<PropertyCreatorDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.propertyForm.valid) {
      this.dialogRef.close(this.propertyForm.value);
    }
  }
}
