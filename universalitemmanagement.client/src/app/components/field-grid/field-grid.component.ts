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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FieldPropertyFacade } from 'src/app/core/domain/store/fields/field-property.state';
import { PropertyCreatorDialogComponent } from './property-creator-dialog/property-creator-dialog.component';

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
    MatDialogModule,
  ],
  templateUrl: './field-grid.component.html',
  styleUrls: ['./field-grid.component.scss'],
})
export class FieldGridComponent {
  @Input() fields: Field[] = [];
  @Input() fieldProperties: Map<string, FieldProperty> = new Map();
  @Output() fieldAdded = new EventEmitter<{ propertyId: string; x: number; y: number; width: number; height: number }>();
  @Output() fieldMoved = new EventEmitter<{ fieldId: string; x: number; y: number }>();
  @Output() fieldValueChanged = new EventEmitter<{ fieldId: string; valueId: string }>();

  FieldPropertyType = FieldPropertyType;
  isLocked = true;
  draggedOption: FieldTypeOption | null = null;
  draggedField: Field | null = null;
  draggedElement: HTMLElement | null = null;

  fieldTypeOptions: FieldTypeOption[] = [];

  constructor(
    private fieldPropertyFacade: FieldPropertyFacade,
    private dialog: MatDialog
  ) {}

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
    console.log('Drag started:', option);

    this.draggedOption = option;
    this.draggedElement = event.target as HTMLElement;

    // Add dragging class
    this.draggedElement.classList.add('dragging');

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('text/plain', option.propertyId);

      // Create a custom drag image
      const dragImage = this.createDragImage(option);
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 50, 25);

      // Remove the drag image after a short delay
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  }

  onDragEnd(): void {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
      this.draggedElement = null;
    }
    this.draggedOption = null;
    this.draggedField = null;
  }

  onFieldDragStart(field: Field, event: DragEvent): void {
    if (this.isLocked) return;

    event.stopPropagation();

    console.log('Field drag started:', field);

    this.draggedField = field;
    this.draggedElement = event.currentTarget as HTMLElement;

    // Add dragging class
    this.draggedElement.classList.add('dragging');

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', field.id);

      // Create a simple drag image for the field
      const rect = this.draggedElement.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(33, 150, 243, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '14px sans-serif';
        ctx.fillText('Moving field...', 10, 25);
      }
      event.dataTransfer.setDragImage(canvas, canvas.width / 2, canvas.height / 2);
    }
  }

  private createDragImage(option: FieldTypeOption): HTMLElement {
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.padding = '12px 16px';
    dragImage.style.backgroundColor = '#2196f3';
    dragImage.style.color = 'white';
    dragImage.style.borderRadius = '8px';
    dragImage.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    dragImage.style.display = 'flex';
    dragImage.style.alignItems = 'center';
    dragImage.style.gap = '8px';
    dragImage.style.fontSize = '14px';
    dragImage.style.fontWeight = '500';
    dragImage.style.whiteSpace = 'nowrap';
    dragImage.innerHTML = `
      <span class="material-icons" style="font-size: 20px;">${this.getIconForType(option.type)}</span>
      <span>${option.label}</span>
    `;
    return dragImage;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      // Set drop effect based on what's being dragged
      event.dataTransfer.dropEffect = this.draggedField ? 'move' : 'copy';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    console.log('Drop event fired', {
      draggedField: this.draggedField,
      draggedOption: this.draggedOption
    });

    const gridElement = event.currentTarget as HTMLElement;
    const rect = gridElement.getBoundingClientRect();

    // Account for padding
    const paddingLeft = 16;
    const paddingTop = 56;

    // Calculate relative position within the grid (excluding padding)
    const relativeX = event.clientX - rect.left - paddingLeft;
    const relativeY = event.clientY - rect.top - paddingTop;

    // Calculate available grid width (total width - both paddings)
    const availableWidth = rect.width - (paddingLeft * 2);

    // Calculate cell dimensions including gap
    const columnWidth = (availableWidth + 16) / 12; // Add gap back to get cell + gap width
    const rowHeight = 60 + 16; // row height + gap

    // Calculate column and row (1-indexed for CSS grid)
    const column = Math.floor(relativeX / columnWidth) + 1;
    const row = Math.floor(relativeY / rowHeight) + 1;

    console.log('Drop position:', {
      clientX: event.clientX,
      clientY: event.clientY,
      relativeX,
      relativeY,
      column,
      row,
      columnWidth,
      rowHeight,
      availableWidth
    });

    // Check if we're dragging a new field type or an existing field
    if (this.draggedOption) {
      // Emit the field addition event
      this.fieldAdded.emit({
        propertyId: this.draggedOption.propertyId,
        x: Math.max(1, Math.min(column, 11)), // Ensure within bounds (1-11, leaving room for width)
        y: Math.max(1, row),
        width: 2, // Default width
        height: 1, // Default height
      });
      this.draggedOption = null;
    } else if (this.draggedField) {
      // Emit the field move event
      const newX = Math.max(1, Math.min(column, 13 - this.draggedField.width));
      const newY = Math.max(1, row);

      // Only emit if position actually changed
      if (newX !== this.draggedField.x || newY !== this.draggedField.y) {
        console.log('Moving field:', {
          fieldId: this.draggedField.id,
          oldPosition: { x: this.draggedField.x, y: this.draggedField.y },
          newPosition: { x: newX, y: newY }
        });

        this.fieldMoved.emit({
          fieldId: this.draggedField.id,
          x: newX,
          y: newY
        });
      }
      this.draggedField = null;
    }
  }

  onValueChanged(event: { fieldId: string; valueId: string }): void {
    this.fieldValueChanged.emit(event);
  }

  openPropertyCreator(): void {
    const dialogRef = this.dialog.open(PropertyCreatorDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Creating new property:', result);
        const newProperty = new FieldProperty({
          name: result.name,
          type: result.type,
        } as FieldProperty);

        this.fieldPropertyFacade.addEntity(newProperty).subscribe((createdProperty: FieldProperty) => {
          console.log('Property created successfully:', createdProperty);
          this.loadAllFieldProperties();
        });
      }
    });
  }
}
