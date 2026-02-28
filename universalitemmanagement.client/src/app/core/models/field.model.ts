import { Entity } from './entity';

export class Field extends Entity {
  x!: number;
  y!: number;
  width!: number;
  height!: number;
  fieldPropertyId!: string;
  fieldPropertyName!: string;
  fieldPropertyType!: string;
  recordId!: string;
  textValue?: string | null;
  booleanValue?: boolean | null;
  dateValue?: Date | null;
  valueId?: string | null;
  hasValue!: boolean;

  constructor(field: Field) {
    super(field);
  }
}
