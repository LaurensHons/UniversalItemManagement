import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ItemList } from 'src/app/core/models/item-list.model';
import { ItemListFacade } from 'src/app/core/domain/store/item-list/item-list.state';
import { ItemListEntities } from 'src/app/core/domain/store/item-list/item-list.state';

@Component({
  selector: 'app-item-list-browser-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './item-list-browser-dialog.component.html',
  styleUrls: ['./item-list-browser-dialog.component.scss'],
})
export class ItemListBrowserDialogComponent implements OnInit {
  itemLists: ItemList[] = [];
  expandedListId: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<ItemListBrowserDialogComponent>,
    private itemListFacade: ItemListFacade,
  ) {}

  ngOnInit(): void {
    this.itemListFacade.getEntities(ItemListEntities.ItemList).subscribe();
    this.itemListFacade.entities$(ItemListEntities.ItemList).subscribe((lists) => {
      this.itemLists = lists;
    });
  }

  toggleExpand(listId: string): void {
    this.expandedListId = this.expandedListId === listId ? null : listId;
  }

  getDisplayColumnName(list: ItemList): string {
    const displayCol = list.columns?.find(c => c.isDisplayColumn);
    return displayCol?.name ?? 'Name';
  }

  getItemDisplayValue(list: ItemList, item: any): string {
    const displayCol = list.columns?.find(c => c.isDisplayColumn);
    if (!displayCol) return '—';
    const val = item.values?.find((v: any) => v.listColumnId === displayCol.id);
    return val?.textValue ?? '—';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
