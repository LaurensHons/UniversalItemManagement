import { Entity } from './entity';

export enum FieldPropertyType {
  Text = 'Text',
  Date = 'Date',
  Boolean = 'Boolean'
}

export class FieldProperty extends Entity {
  name!: string;
  type!: FieldPropertyType;

  constructor(fieldProperty: FieldProperty) {
    super(fieldProperty);
  }
}
