import { Entity } from './entity';

export class Field extends Entity {
  x!: number;
  y!: number;
  width!: number;
  height!: number;
  textValueId?: string;
  booleanValueId?: string;
  dateValueId?: string;
  propertyId!: string;
  recordId!: string;

  constructor(field: Field) {
    super(field);
  }
}
