import { Entity } from './entity';

export class Field extends Entity {
  x!: number;
  y!: number;
  width!: number;
  height!: number;
  valueId?: string;
  propertyId!: string;
  recordId!: string;

  constructor(field: Field) {
    super(field);
  }
}
