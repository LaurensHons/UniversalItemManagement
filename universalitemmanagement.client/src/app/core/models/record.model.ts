import { Entity } from './entity';
import { Field } from './field.model';

export class Record extends Entity {
  name!: string;
  description!: string;
  fields: Field[] = [];

  constructor(record: Record) {
    super(record);
    this.fields = record.fields || [];
  }
}
