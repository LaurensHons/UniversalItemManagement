import { Injectable } from '@angular/core';
import { Action, ActionCreator, select, Store } from '@ngrx/store';
import { filter, map, Observable } from 'rxjs';

import { TypedAction } from '@ngrx/store/src/models';
import { Entity } from 'src/app/core/models/entity';
import { ActionBase } from '../base/action-base.interface';
import { CoreFeature } from '../core.feature';
import {
  addEntity,
  getEntities,
  getEntity,
  deleteEntity,
  updateEntity,
} from './entity.actions';
import { EntityState } from './entity.reducer';

@Injectable({
  providedIn: 'root',
})
export abstract class EntityFacade<T extends Entity, Enum extends string> {
  constructor(
    private _store: Store<CoreFeature>,
    private entityFeatureKey: string
  ) {}

  entityState = (state: CoreFeature) =>
    (state.coreFeature as any)[this.entityFeatureKey] as EntityState<Enum>;

  state$ = this._store.pipe(
    select(this.entityState),
    map((state) => state.entities)
  );

  entities$<T extends Entity>(entitySlice: Enum): Observable<T[]> {
    return this.state$.pipe(
      map((entities) => entities[entitySlice]?.list),
      map(
        (entities) => Object.values(entities ?? {}).filter((x) => !!x) as T[]
      ),
      filter((entities) => !!entities)
    );
  }

  entity$(entitySlice: Enum, id: string): Observable<T> {
    return this.state$.pipe(
      map((entities) => entities[entitySlice]?.list[id] as T),
      filter((entity) => !!entity)
    );
  }

  getEntities(entitySlice: Enum) {
    return this.dispatchAction$(getEntities(entitySlice.toString()));
  }

  getEntitiesPaged(
    entitySlice: Enum,
    pageSize: number,
    page: number,
    sortedColumn: string,
    sortDirection: string,
    resetPaging = false
  ) {
    return this.dispatchAction$(getEntities(entitySlice.toString()), {
      pageSize,
      page,
      sortedColumn,
      sortDirection,
      resetPaging,
    });
  }

  getEntity(entitySlice: Enum, entitiyId: string) {
    return this.dispatchAction$(getEntity(entitySlice.toString()), {
      entitiyId,
    });
  }

  addEntity(entitySlice: Enum, entity: T) {
    return this.dispatchAction$(addEntity(entitySlice.toString()), {
      entity: entity as Entity,
    });
  }

  updateEntity(entitySlice: Enum, entity: T) {
    return this.dispatchAction$(updateEntity<T>(entitySlice.toString()), {
      entity: entity,
    });
  }

  removeEntity(entitySlice: Enum, entityId: string) {
    return this.dispatchAction$(deleteEntity(entitySlice.toString()), {
      entityId,
    });
  }

  private dispatchAction$<R, P>(
    action: ActionCreator<
      string,
      (props: P & ActionBase<R>) => (P & ActionBase<R>) & TypedAction<string>
    >,
    props?: P
  ) {
    return new Observable<R>((subscriber) => {
      this._store.dispatch(
        action({
          callback: (value: R) => {
            subscriber.next(value);
            subscriber.complete();
          },
          error: (e: Error) => {
            subscriber.error(e);
            subscriber.complete();
          },
          ...props,
        } as P & ActionBase<R>) as Action
      );
    });
  }
}
