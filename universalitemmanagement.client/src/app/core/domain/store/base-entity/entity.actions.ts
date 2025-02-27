import { createAction, props } from '@ngrx/store';
import { ActionBase } from '../base/action-base.interface';
import { Entity } from 'src/app/core/models/entity';

export const getEntities = (entity: string) =>
  createAction(
    `[Entity.${entity}] Get entities`,
    props<
      {
        pageSize: number;
        page: number;
        sortedColumn: string;
        sortDirection: string;
        resetPaging: boolean;
      } & ActionBase<Entity[]>
    >()
  );

export const getEntitiesResolved = (entity: string) =>
  createAction(
    `[Entity.${entity}] Get entities resolved`,
    props<{
      result: Entity[];
      totalRecordCount: number;
      resetPaging: boolean;
    }>()
  );

export const getEntity = (entity: string) =>
  createAction(
    `[Entity.${entity}] Get entity`,
    props<
      {
        entitiyId: string;
      } & ActionBase<Entity>
    >()
  );

export const getEntityResolved = (entity: string) =>
  createAction(
    `[Entity.${entity}] Get entity resolved`,
    props<{
      entity: Entity;
    }>()
  );

export const getAllEntities = (entity: string) =>
  createAction(
    `[Entity.${entity}] Get all entities`,
    props<
      {
        result: { id: string; name: string }[];
      } & ActionBase<{ id: string; name: string }[]>
    >()
  );

export const getAllEntitiesResolved = (entity: string) =>
  createAction(
    `[Entity.${entity}] Get all entities resolved`,
    props<{
      result: { id: string; name: string }[];
    }>()
  );

export const addEntity = (entity: string) =>
  createAction(
    `[Entity.${entity}] Add entity`,
    props<
      {
        entity: Entity;
      } & ActionBase<Entity>
    >()
  );

export const addEntityResolved = (entity: string) =>
  createAction(
    `[Entity.${entity}] Add entity resolved`,
    props<{
      entity: Entity;
    }>()
  );

export const updateEntity = <T extends Entity>(entity: string) =>
  createAction(
    `[Entity.${entity}] Update entity`,
    props<
      {
        entity: T;
      } & ActionBase<T>
    >()
  );

export const updateEntityResolved = <T extends Entity>(entity: string) =>
  createAction(
    `[Entity.${entity}] Update entity resolved`,
    props<{
      entity: T;
    }>()
  );

export const removeEntity = (entity: string) =>
  createAction(
    `[Entity.${entity}] Remove entity`,
    props<
      {
        entityId: string;
      } & ActionBase<boolean>
    >()
  );

export const removeEntityResolved = (entity: string) =>
  createAction(
    `[Entity.${entity}] Remove entity resolved`,
    props<{
      entityId: string;
    }>()
  );
