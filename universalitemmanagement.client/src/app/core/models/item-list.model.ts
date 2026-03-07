import { Entity } from './entity';

export interface ListColumn {
  id: string;
  name: string;
  type: string;
  order: number;
  isDisplayColumn: boolean;
  itemListId: string;
}

export interface ListItemValue {
  id: string;
  listColumnId: string;
  listItemId: string;
  textValue?: string | null;
  booleanValue?: boolean | null;
  dateValue?: string | null;
  numberValue?: number | null;
}

export class ListItem extends Entity {
  order!: number;
  color?: string | null;
  itemListId!: string;
  values?: ListItemValue[];

  constructor(item: ListItem) {
    super(item);
  }
}

export class ItemList extends Entity {
  name!: string;
  columns?: ListColumn[];
  items?: ListItem[];

  constructor(list: ItemList) {
    super(list);
  }
}
