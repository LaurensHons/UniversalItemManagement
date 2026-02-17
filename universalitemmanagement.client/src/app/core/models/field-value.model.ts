import { Entity } from './entity';

export class TextValue {
  valueId!: string;
  value!: string;
}

export class BooleanValue {
  valueId!: string;
  value!: boolean;
}

export class DateValue {
  valueId!: string;
  value!: Date;
}

export class FieldValue extends Entity {
  textValueId?: string;
  textValue?: TextValue;
  booleanValueId?: string;
  booleanValue?: BooleanValue;
  dateValueId?: string;
  dateValue?: DateValue;

  constructor(fieldValue: FieldValue) {
    super(fieldValue);
  }
}
