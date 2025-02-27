import { Entity } from './entity';

export class Record extends Entity {
  name!: string;
  description!: string;

  constructor(record: Record) {
    super(record);
  }
}
