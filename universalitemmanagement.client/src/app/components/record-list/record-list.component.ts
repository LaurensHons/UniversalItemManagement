import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Record } from 'src/app/core/models/record.model';
import { Field } from 'src/app/core/models/field.model';
import {
  RecordEntities,
  RecordFacade,
} from 'src/app/core/domain/store/record/record.state';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ItemListBrowserDialogComponent } from './item-list-browser-dialog/item-list-browser-dialog.component';

export interface TableColumn {
  propertyId: string;
  name: string;
  type: string;
  visible: boolean;
}

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.scss'],
})
export class RecordListComponent implements OnInit {
  public records: Record[] = [];
  columns: TableColumn[] = [];
  columnPickerOpen = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];

  private datePipe = new DatePipe('en-US');

  constructor(
    private recordService: RecordFacade,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.recordService.getEntities(RecordEntities.Record).subscribe();
    this.recordService
      .entities$(RecordEntities.Record)
      .subscribe((records) => {
        this.records = records;
        this.buildColumns(records);
      });
  }

  get visibleColumns(): TableColumn[] {
    return this.columns.filter(c => c.visible);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.records.length / this.pageSize));
  }

  get paginatedRecords(): Record[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.records.slice(start, start + this.pageSize);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.records.length);
  }

  goToPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  toggleColumn(col: TableColumn): void {
    col.visible = !col.visible;
  }

  getDisplayValue(record: Record, propertyId: string): string {
    const field = record.fields?.find(f => f.fieldPropertyId === propertyId);
    if (!field || !field.hasValue) return '—';
    return this.formatFieldValue(field);
  }

  private formatFieldValue(field: Field): string {
    switch (field.fieldPropertyType) {
      case 'Text':
        return field.textValue ?? '—';
      case 'Boolean':
        return field.booleanValue === true ? 'Yes'
             : field.booleanValue === false ? 'No'
             : '—';
      case 'Date':
        return field.dateValue
          ? (this.datePipe.transform(field.dateValue, 'MMM d, y') ?? '—')
          : '—';
      case 'Number':
        return field.numberValue != null ? String(field.numberValue) : '—';
      case 'Select':
        return field.selectedItemIds?.length
          ? `${field.selectedItemIds.length} selected`
          : '—';
      default:
        return '—';
    }
  }

  openItemListBrowser(): void {
    this.dialog.open(ItemListBrowserDialogComponent, {
      width: '560px',
      panelClass: 'ww-dialog',
    });
  }

  private buildColumns(records: Record[]): void {
    const seen = new Map<string, TableColumn>();

    for (const record of records) {
      for (const field of record.fields ?? []) {
        if (!seen.has(field.fieldPropertyId)) {
          // Preserve existing visibility if column was already known
          const existing = this.columns.find(c => c.propertyId === field.fieldPropertyId);
          seen.set(field.fieldPropertyId, {
            propertyId: field.fieldPropertyId,
            name: field.fieldPropertyName,
            type: field.fieldPropertyType,
            visible: existing?.visible ?? true,
          });
        }
      }
    }

    this.columns = Array.from(seen.values());
  }
}
