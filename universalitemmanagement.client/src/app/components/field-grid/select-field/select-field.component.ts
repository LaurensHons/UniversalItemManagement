import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { ListItem } from 'src/app/core/models/item-list.model';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.scss'],
})
export class SelectFieldComponent implements OnInit, OnChanges {
  @Input() field!: Field;
  @Input() property!: FieldProperty;
  @Output() valueChanged = new EventEmitter<Field>();

  selectedItems: ListItem[] = [];
  items: ListItem[] = [];
  isOpen = false;
  status: SaveStatus = 'idle';

  private displayColumnId: string | null = null;
  private savedTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private fieldFacade: FieldFacade) {}

  ngOnInit(): void {
    this.loadItems();
    this.loadValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property']) {
      this.loadItems();
    }
    if (changes['field'] && !changes['field'].firstChange) {
      this.loadValue();
    }
  }

  private loadItems(): void {
    this.items = this.property?.itemList?.items ?? [];
    this.displayColumnId = this.property?.itemList?.columns?.find(c => c.isDisplayColumn)?.id ?? null;
  }

  private loadValue(): void {
    const ids = this.field.selectedItemIds ?? [];
    this.selectedItems = this.items.filter(i => ids.includes(i.id));
  }

  getItemName(item: ListItem): string {
    if (!this.displayColumnId || !item.values) return '';
    const val = item.values.find(v => v.listColumnId === this.displayColumnId);
    return val?.textValue ?? '';
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  isSelected(item: ListItem): boolean {
    return this.selectedItems.some(i => i.id === item.id);
  }

  get isMultiSelect(): boolean {
    return this.property?.isMultiSelect ?? false;
  }

  selectItem(item: ListItem): void {
    this.isOpen = false;
    const currentId = this.field.selectedItemIds?.[0] ?? null;
    if (item.id === currentId) return;
    this.save([item.id]);
  }

  toggleItem(item: ListItem): void {
    let newIds: string[];
    if (this.isSelected(item)) {
      newIds = (this.field.selectedItemIds ?? []).filter(id => id !== item.id);
    } else {
      newIds = [...(this.field.selectedItemIds ?? []), item.id];
    }
    this.save(newIds);
  }

  clearAll(): void {
    this.isOpen = false;
    if (!this.field.selectedItemIds?.length) return;
    this.save([]);
  }

  private save(newIds: string[]): void {
    this.status = 'saving';
    this.selectedItems = this.items.filter(i => newIds.includes(i.id));
    const updatedField = new Field({ ...this.field, selectedItemIds: newIds });

    this.fieldFacade.updateEntity(updatedField).subscribe({
      next: (savedField: Field) => {
        this.status = 'saved';
        this.valueChanged.emit(savedField);
        this.clearSavedStatus();
      },
      error: () => {
        this.status = 'error';
        this.loadValue();
        this.clearSavedStatus();
      },
    });
  }

  onClickOutside(): void {
    this.isOpen = false;
  }

  getItemColor(item: ListItem): string {
    return item.color ?? 'var(--ww-ink-muted)';
  }

  private clearSavedStatus(): void {
    if (this.savedTimeout) clearTimeout(this.savedTimeout);
    this.savedTimeout = setTimeout(() => { this.status = 'idle'; }, 2500);
  }
}
