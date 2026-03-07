import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { PropertyFormComponent, PropertyFormValue } from '../property-form/property-form.component';

export interface PropertyEditorDialogData {
  property: FieldProperty;
}

@Component({
  selector: 'app-property-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    PropertyFormComponent,
  ],
  templateUrl: './property-editor-dialog.component.html',
  styleUrls: ['./property-editor-dialog.component.scss'],
})
export class PropertyEditorDialogComponent implements OnInit {
  initialData!: PropertyFormValue;
  formValue: PropertyFormValue | null = null;
  isFormValid = false;

  constructor(
    private dialogRef: MatDialogRef<PropertyEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PropertyEditorDialogData
  ) {}

  ngOnInit(): void {
    const prop = this.data.property;
    const items = prop.itemList?.items ?? [];
    const displayCol = prop.itemList?.columns?.find(c => c.isDisplayColumn);

    this.initialData = {
      name: prop.name,
      type: prop.type,
      isMultiSelect: prop.isMultiSelect ?? false,
      selectOptions: items.map(item => {
        const nameVal = displayCol
          ? item.values?.find(v => v.listColumnId === displayCol.id)
          : undefined;
        return {
          id: item.id,
          name: nameVal?.textValue ?? '',
          color: item.color ?? '#c45d3e',
        };
      }),
    };
  }

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
    this.dialogRef.close(this.formValue);
  }
}
