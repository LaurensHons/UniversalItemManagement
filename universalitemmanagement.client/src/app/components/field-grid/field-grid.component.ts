import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { TextFieldComponent } from './text-field/text-field.component';
import { DateFieldComponent } from './date-field/date-field.component';
import { BooleanFieldComponent } from './boolean-field/boolean-field.component';
import { FieldPropertyType } from 'src/app/core/models/field-property.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FieldPropertyFacade } from 'src/app/core/domain/store/fields/field-property.state';

interface FieldTypeOption {
  propertyId: string;
  type: FieldPropertyType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-field-grid',
  standalone: true,
  imports: [
    CommonModule,
    TextFieldComponent,
    DateFieldComponent,
    BooleanFieldComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './field-grid.component.html',
  styleUrls: ['./field-grid.component.scss'],
})
export class FieldGridComponent {
  @Input() fields: Field[] = [];
  @Input() fieldProperties: Map<string, FieldProperty> = new Map();
  @Output() fieldAdded = new EventEmitter<{ propertyId: string; x: number; y: number; width: number; height: number }>();

  FieldPropertyType = FieldPropertyType;
  isLocked = true;
  draggedFieldType: FieldPropertyType | null = null;
  draggedPropertyId: string | null = null;

  fieldTypeOptions: FieldTypeOption[] = [];

  constructor(private fieldPropertyFacade: FieldPropertyFacade) {}

  getFieldProperty(field: Field): FieldProperty | undefined {
    return this.fieldProperties.get(field.propertyId);
  }

  trackByFieldId(index: number, field: Field): string {
    return field.id;
  }

  trackByFieldType(index: number, option: FieldTypeOption): string {
    return option.propertyId;
  }

  toggleLock(): void {
    this.isLocked = !this.isLocked;

    // Fetch all field properties when unlocking
    if (!this.isLocked) {
      this.loadAllFieldProperties();
    }
  }

  private loadAllFieldProperties(): void {
    this.fieldPropertyFacade.getEntities().subscribe((properties: FieldProperty[]) => {
      this.fieldTypeOptions = properties.map(property => ({
        propertyId: property.id,
        type: property.type,
        label: property.name,
        icon: this.getIconForType(property.type),
      }));
    });
  }

  private getIconForType(type: FieldPropertyType): string {
    switch (type) {
      case FieldPropertyType.Text:
        return 'text_fields';
      case FieldPropertyType.Date:
        return 'calendar_today';
      case FieldPropertyType.Boolean:
        return 'check_box';
      default:
        return 'help_outline';
    }
  }

  onDragStart(option: FieldTypeOption, event: DragEvent): void {
    this.draggedFieldType = option.type;
    this.draggedPropertyId = option.propertyId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('fieldType', option.type.toString());
      event.dataTransfer.setData('propertyId', option.propertyId);
    }
  }

  onDragEnd(): void {
    this.draggedFieldType = null;
    this.draggedPropertyId = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    console.log(event, this.draggedFieldType, this.draggedPropertyId);

    if (!this.draggedFieldType || !this.draggedPropertyId) return;

    const gridElement = (event.currentTarget as HTMLElement);
    const rect = gridElement.getBoundingClientRect();

    // Calculate relative position within the grid
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;

    // Calculate grid column and row based on position
    const columnWidth = rect.width / 12;
    const rowHeight = 60 + 16; // row height + gap

    const column = Math.floor(relativeX / columnWidth) + 1;
    const row = Math.floor(relativeY / rowHeight) + 1;

    // Use the dragged property ID directly
    this.fieldAdded.emit({
      propertyId: this.draggedPropertyId,
      x: Math.max(1, Math.min(column, 11)), // Ensure within bounds (1-11, leaving room for width)
      y: Math.max(1, row),
      width: 2, // Default width
      height: 1, // Default height
    });

    this.draggedFieldType = null;
    this.draggedPropertyId = null;
  }
}
