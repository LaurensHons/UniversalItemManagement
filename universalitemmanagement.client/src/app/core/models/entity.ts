export class Entity {
  id!: string;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;

  constructor(entity: Entity) {
    Object.assign(this, entity);
  }
}
