import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty, FieldPropertyType } from 'src/app/core/models/field-property.model';
import { TextFieldComponent } from './text-field/text-field.component';
import { DateFieldComponent } from './date-field/date-field.component';
import { BooleanFieldComponent } from './boolean-field/boolean-field.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FieldPropertyFacade } from 'src/app/core/domain/store/fields/field-property.state';
import { PropertyCreatorDialogComponent } from './property-creator-dialog/property-creator-dialog.component';

export interface FieldTypeOption {
  propertyId: string;
  type: FieldPropertyType;
  label: string;
  icon: string;
}

interface GridGhost {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResizeState {
  field: Field;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

const GRID_COLS = 12;
const GRID_ROW_HEIGHT = 64;
const GRID_GAP = 12;

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
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ width: 0, opacity: 0 }),
        animate('250ms cubic-bezier(0.22, 1, 0.36, 1)', style({ width: '220px', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.22, 1, 0.36, 1)', style({ width: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class FieldGridComponent implements OnDestroy {
  @Input() fields: Field[] = [];
  @Input() fieldProperties: Map<string, FieldProperty> = new Map();
  @Output() fieldAdded = new EventEmitter<{ propertyId: string; x: number; y: number; width: number; height: number }>();
  @Output() fieldMoved = new EventEmitter<{ fieldId: string; x: number; y: number }>();
  @Output() fieldResized = new EventEmitter<{ fieldId: string; width: number; height: number }>();
  @Output() fieldValueChanged = new EventEmitter<Field>();
  @Output() fieldDeleted = new EventEmitter<string>();

  @ViewChild('gridArea', { static: false }) gridArea!: ElementRef<HTMLElement>;

  FieldPropertyType = FieldPropertyType;
  isLocked = true;
  sidebarExpanded = true;

  // Drag state
  draggedOption: FieldTypeOption | null = null;
  draggedField: Field | null = null;
  isDraggingOver = false;
  ghost: GridGhost | null = null;

  // Resize state
  resizeState: ResizeState | null = null;

  // Delete confirmation
  deleteConfirmId: string | null = null;

  fieldTypeOptions: FieldTypeOption[] = [];

  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundMouseUp: ((e: MouseEvent) => void) | null = null;
  private deleteConfirmTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private fieldPropertyFacade: FieldPropertyFacade,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnDestroy(): void {
    this.cleanupListeners();
    if (this.deleteConfirmTimeout) {
      clearTimeout(this.deleteConfirmTimeout);
    }
  }

  // ─── Public API ───────────────────────────────────────────────

  getFieldProperty(field: Field): FieldProperty | undefined {
    return this.fieldProperties.get(field.fieldPropertyId);
  }

  getFieldTypeIcon(field: Field): string {
    const prop = this.getFieldProperty(field);
    if (!prop) return 'help_outline';
    return this.getIconForType(prop.type);
  }

  getFieldTypeLabel(field: Field): string {
    const prop = this.getFieldProperty(field);
    return prop?.name ?? 'Unknown';
  }

  trackByFieldId(_index: number, field: Field): string {
    return field.id;
  }

  trackByFieldType(_index: number, option: FieldTypeOption): string {
    return option.propertyId;
  }

  // ─── Lock/Unlock ──────────────────────────────────────────────

  toggleLock(): void {
    this.isLocked = !this.isLocked;
    this.deleteConfirmId = null;
    if (!this.isLocked) {
      this.loadAllFieldProperties();
    }
  }

  toggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  // ─── Grid Calculations ────────────────────────────────────────

  get gridRows(): number {
    if (!this.fields.length) return 6;
    const maxRow = Math.max(...this.fields.map(f => f.y + f.height));
    return Math.max(6, maxRow + 2);
  }

  getFieldStyle(field: Field): Record<string, string> {
    return {
      'grid-column': `${field.x} / span ${field.width}`,
      'grid-row': `${field.y} / span ${field.height}`,
    };
  }

  getGhostStyle(): Record<string, string> {
    if (!this.ghost) return {};
    return {
      'grid-column': `${this.ghost.x} / span ${this.ghost.width}`,
      'grid-row': `${this.ghost.y} / span ${this.ghost.height}`,
    };
  }

  private pixelToGrid(clientX: number, clientY: number): { col: number; row: number } {
    if (!this.gridArea) return { col: 1, row: 1 };

    const rect = this.gridArea.nativeElement.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const colWidth = (rect.width + GRID_GAP) / GRID_COLS;
    const rowHeight = GRID_ROW_HEIGHT + GRID_GAP;

    const col = Math.max(1, Math.min(GRID_COLS, Math.floor(relX / colWidth) + 1));
    const row = Math.max(1, Math.floor(relY / rowHeight) + 1);

    return { col, row };
  }

  private hasCollision(x: number, y: number, w: number, h: number, excludeId?: string): boolean {
    return this.fields.some(f => {
      if (excludeId && f.id === excludeId) return false;
      return !(x + w <= f.x || f.x + f.width <= x || y + h <= f.y || f.y + f.height <= y);
    });
  }

  // ─── Sidebar Drag Start ───────────────────────────────────────

  onDragStart(option: FieldTypeOption, event: DragEvent): void {
    this.draggedOption = option;
    this.draggedField = null;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('text/plain', option.propertyId);

      const dragImage = this.createDragImage(option);
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 60, 20);
      requestAnimationFrame(() => document.body.removeChild(dragImage));
    }
  }

  // ─── Field Drag Start ────────────────────────────────────────

  onFieldDragStart(field: Field, event: DragEvent): void {
    if (this.isLocked) return;
    event.stopPropagation();

    this.draggedOption = null;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', field.id);
    }

    // Defer so the browser finishes initializing the drag before
    // Angular applies the --dragging class (pointer-events:none + transform)
    requestAnimationFrame(() => {
      this.draggedField = field;
      this.cdr.markForCheck();
    });
  }

  onDragEnd(): void {
    console.log("dragstop")
    this.draggedOption = null;
    this.draggedField = null;
    this.isDraggingOver = false;
    this.ghost = null;
  }

  // ─── Grid Drop Zone ──────────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = true;

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.draggedField ? 'move' : 'copy';
    }

    const { col, row } = this.pixelToGrid(event.clientX, event.clientY);

    if (this.draggedOption) {
      const w = this.getDefaultWidth(this.draggedOption.type);
      const clampedX = Math.min(col, GRID_COLS - w + 1);
      this.ghost = { x: clampedX, y: row, width: w, height: 1 };
    } else if (this.draggedField) {
      const clampedX = Math.min(col, GRID_COLS - this.draggedField.width + 1);
      this.ghost = { x: clampedX, y: row, width: this.draggedField.width, height: this.draggedField.height };
    }
  }

  onDragLeave(event: DragEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) {
      this.isDraggingOver = false;
      this.ghost = null;
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const { col, row } = this.pixelToGrid(event.clientX, event.clientY);

    if (this.draggedOption) {
      const w = this.getDefaultWidth(this.draggedOption.type);
      const x = Math.max(1, Math.min(col, GRID_COLS - w + 1));
      const y = Math.max(1, row);

      if (!this.hasCollision(x, y, w, 1)) {
        this.fieldAdded.emit({
          propertyId: this.draggedOption.propertyId,
          x,
          y,
          width: w,
          height: 1,
        });
      }
    } else if (this.draggedField) {
      const x = Math.max(1, Math.min(col, GRID_COLS - this.draggedField.width + 1));
      const y = Math.max(1, row);

      if (x !== this.draggedField.x || y !== this.draggedField.y) {
        if (!this.hasCollision(x, y, this.draggedField.width, this.draggedField.height, this.draggedField.id)) {
          this.fieldMoved.emit({ fieldId: this.draggedField.id, x, y });
        }
      }
    }

    this.onDragEnd();
  }

  // ─── Resize ───────────────────────────────────────────────────

  onResizeStart(field: Field, event: MouseEvent): void {
    if (this.isLocked) return;
    event.preventDefault();
    event.stopPropagation();

    this.resizeState = {
      field,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: field.width,
      startHeight: field.height,
    };

    this.zone.runOutsideAngular(() => {
      this.boundMouseMove = (e: MouseEvent) => this.onResizeMove(e);
      this.boundMouseUp = (e: MouseEvent) => this.onResizeEnd(e);
      document.addEventListener('mousemove', this.boundMouseMove);
      document.addEventListener('mouseup', this.boundMouseUp);
    });
  }

  private onResizeMove(event: MouseEvent): void {
    if (!this.resizeState || !this.gridArea) return;

    const rect = this.gridArea.nativeElement.getBoundingClientRect();
    const colWidth = (rect.width + GRID_GAP) / GRID_COLS;
    const rowHeight = GRID_ROW_HEIGHT + GRID_GAP;

    const dx = event.clientX - this.resizeState.startX;
    const dy = event.clientY - this.resizeState.startY;

    const deltaCols = Math.round(dx / colWidth);
    const deltaRows = Math.round(dy / rowHeight);

    const newWidth = Math.max(1, Math.min(
      this.resizeState.startWidth + deltaCols,
      GRID_COLS - this.resizeState.field.x + 1
    ));
    const newHeight = Math.max(1, this.resizeState.startHeight + deltaRows);

    this.zone.run(() => {
      this.ghost = {
        x: this.resizeState!.field.x,
        y: this.resizeState!.field.y,
        width: newWidth,
        height: newHeight,
      };
      this.cdr.markForCheck();
    });
  }

  private onResizeEnd(_event: MouseEvent): void {
    this.cleanupListeners();

    if (this.resizeState && this.ghost) {
      const { field } = this.resizeState;
      const newWidth = this.ghost.width;
      const newHeight = this.ghost.height;

      if (newWidth !== field.width || newHeight !== field.height) {
        if (!this.hasCollision(field.x, field.y, newWidth, newHeight, field.id)) {
          this.fieldResized.emit({ fieldId: field.id, width: newWidth, height: newHeight });
        }
      }
    }

    this.resizeState = null;
    this.ghost = null;
    this.cdr.markForCheck();
  }

  private cleanupListeners(): void {
    if (this.boundMouseMove) {
      document.removeEventListener('mousemove', this.boundMouseMove);
      this.boundMouseMove = null;
    }
    if (this.boundMouseUp) {
      document.removeEventListener('mouseup', this.boundMouseUp);
      this.boundMouseUp = null;
    }
  }

  // ─── Delete ───────────────────────────────────────────────────

  onDeleteClick(fieldId: string, event: MouseEvent): void {
    event.stopPropagation();

    if (this.deleteConfirmId === fieldId) {
      this.fieldDeleted.emit(fieldId);
      this.deleteConfirmId = null;
      if (this.deleteConfirmTimeout) {
        clearTimeout(this.deleteConfirmTimeout);
        this.deleteConfirmTimeout = null;
      }
    } else {
      this.deleteConfirmId = fieldId;
      if (this.deleteConfirmTimeout) clearTimeout(this.deleteConfirmTimeout);
      this.deleteConfirmTimeout = setTimeout(() => {
        this.deleteConfirmId = null;
        this.cdr.markForCheck();
      }, 3000);
    }
  }

  isDeleteConfirming(fieldId: string): boolean {
    return this.deleteConfirmId === fieldId;
  }

  // ─── Value Changed ────────────────────────────────────────────

  onValueChanged(field: Field): void {
    this.fieldValueChanged.emit(field);
  }

  // ─── Property Creator ─────────────────────────────────────────

  openPropertyCreator(): void {
    const dialogRef = this.dialog.open(PropertyCreatorDialogComponent, {
      width: '480px',
      panelClass: 'ww-dialog',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newProperty = new FieldProperty({
          name: result.name,
          type: result.type,
        } as FieldProperty);

        this.fieldPropertyFacade.addEntity(newProperty).subscribe(() => {
          this.loadAllFieldProperties();
        });
      }
    });
  }

  // ─── Private Helpers ──────────────────────────────────────────

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
      case FieldPropertyType.Text:    return 'notes';
      case FieldPropertyType.Date:    return 'event';
      case FieldPropertyType.Boolean: return 'toggle_on';
      default:                        return 'help_outline';
    }
  }

  private getDefaultWidth(type: FieldPropertyType): number {
    switch (type) {
      case FieldPropertyType.Boolean: return 2;
      case FieldPropertyType.Date:    return 3;
      case FieldPropertyType.Text:    return 4;
      default:                        return 3;
    }
  }

  private createDragImage(option: FieldTypeOption): HTMLElement {
    const el = document.createElement('div');
    const style = getComputedStyle(document.documentElement);
    const terracotta = style.getPropertyValue('--ww-terracotta').trim() || '#c45d3e';
    el.style.cssText = `
      position: absolute; top: -9999px; left: -9999px;
      padding: 8px 16px; border-radius: 8px;
      background: ${terracotta}; color: var(--ww-white, #fff);
      font-family: var(--ww-font-display, 'Sora', sans-serif); font-size: 13px; font-weight: 500;
      display: flex; align-items: center; gap: 8px;
      box-shadow: var(--ww-shadow-md, 0 4px 12px rgba(0,0,0,0.2));
      white-space: nowrap;
    `;
    el.innerHTML = `<span class="material-icons" style="font-size:18px">${this.getIconForType(option.type)}</span><span>${option.label}</span>`;
    return el;
  }
}
