import { Entity } from './entity';

export class UTask extends Entity {
  name!: string;
  description!: string;

  constructor(utask: UTask) {
    super(utask);
  }
}
