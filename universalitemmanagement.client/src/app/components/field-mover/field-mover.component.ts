import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Field } from 'src/app/core/models/field.model';

interface FieldPosition {
  field: Field;
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-field-mover',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './field-mover.component.html',
  styleUrls: ['./field-mover.component.scss'],
})
export class FieldMoverComponent implements OnInit {
  @Input() fields: Field[] = [];

  fieldPositions: FieldPosition[] = [];
  selectedField: FieldPosition | null = null;
  gridSize: number = 10;
  canvasWidth: number = 800;
  canvasHeight: number = 600;

  ngOnInit(): void {
    this.initializeFieldPositions();
  }

  initializeFieldPositions(): void {
    this.fieldPositions = this.fields.map((field, index) => ({
      field: field,
      x: field.x || 50 + (index * 150),
      y: field.y || 50 + (Math.floor(index / 4) * 100),
      width: field.width || 120,
      height: field.height || 80,
    }));
  }

  onDragEnded(event: CdkDragEnd, fieldPos: FieldPosition): void {
    const dragElement = event.source.element.nativeElement;
    const transform = dragElement.style.transform;

    // Extract translation values
    const match = transform.match(/translate3d\((.+?)px, (.+?)px, (.+?)px\)/);
    if (match) {
      const deltaX = parseFloat(match[1]);
      const deltaY = parseFloat(match[2]);

      // Update position
      fieldPos.x = Math.max(0, Math.min(this.canvasWidth - fieldPos.width, fieldPos.x + deltaX));
      fieldPos.y = Math.max(0, Math.min(this.canvasHeight - fieldPos.height, fieldPos.y + deltaY));

      // Snap to grid
      fieldPos.x = Math.round(fieldPos.x / this.gridSize) * this.gridSize;
      fieldPos.y = Math.round(fieldPos.y / this.gridSize) * this.gridSize;

      // Update the field model
      fieldPos.field.x = fieldPos.x;
      fieldPos.field.y = fieldPos.y;

      // Reset transform
      dragElement.style.transform = 'none';
    }
  }

  selectField(fieldPos: FieldPosition): void {
    this.selectedField = fieldPos;
  }

  updateFieldSize(): void {
    if (this.selectedField) {
      // Ensure dimensions stay within canvas
      this.selectedField.width = Math.min(this.selectedField.width, this.canvasWidth - this.selectedField.x);
      this.selectedField.height = Math.min(this.selectedField.height, this.canvasHeight - this.selectedField.y);

      // Update the field model
      this.selectedField.field.width = this.selectedField.width;
      this.selectedField.field.height = this.selectedField.height;
    }
  }

  resetPositions(): void {
    this.fieldPositions.forEach((fieldPos, index) => {
      fieldPos.x = 50 + (index * 150);
      fieldPos.y = 50 + (Math.floor(index / 4) * 100);
      fieldPos.width = 120;
      fieldPos.height = 80;

      fieldPos.field.x = fieldPos.x;
      fieldPos.field.y = fieldPos.y;
      fieldPos.field.width = fieldPos.width;
      fieldPos.field.height = fieldPos.height;
    });
    this.selectedField = null;
  }

  saveLayout(): void {
    // TODO: Implement API call to save field positions
    console.log('Saving field layout:', this.fieldPositions.map(fp => ({
      id: fp.field.id,
      x: fp.x,
      y: fp.y,
      width: fp.width,
      height: fp.height,
    })));
  }

  getFieldStyle(fieldPos: FieldPosition): any {
    return {
      position: 'absolute',
      left: `${fieldPos.x}px`,
      top: `${fieldPos.y}px`,
      width: `${fieldPos.width}px`,
      height: `${fieldPos.height}px`,
      border: this.selectedField === fieldPos ? '2px solid #3f51b5' : '1px solid #ccc',
      'background-color': '#ffffff',
      'box-shadow': this.selectedField === fieldPos ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'move',
      'z-index': this.selectedField === fieldPos ? 10 : 1,
    };
  }
}
