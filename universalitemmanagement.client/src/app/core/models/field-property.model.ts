import { Entity } from './entity';
import { ItemList } from './item-list.model';

export enum FieldPropertyType {
  Text = 'Text',
  Date = 'Date',
  Boolean = 'Boolean',
  Number = 'Number',
  Select = 'Select',
}

export class FieldProperty extends Entity {
  name!: string;
  type!: FieldPropertyType;
  isMultiSelect!: boolean;
  itemListId?: string | null;
  itemList?: ItemList | null;

  constructor(fieldProperty: FieldProperty) {
    super(fieldProperty);
  }
}
