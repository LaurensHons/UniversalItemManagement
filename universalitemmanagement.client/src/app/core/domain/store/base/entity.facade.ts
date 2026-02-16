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
import { v4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export abstract class EntityFacade<T extends Entity, Enum extends string> {
  constructor(
    private _store: Store<CoreFeature>,
    private entityFeatureKey: string,
    private defaultEntitySlice: Enum
  ) {}

  entityState = (state: CoreFeature) =>
    (state.coreFeature as any)[this.entityFeatureKey] as EntityState<Enum>;

  state$ = this._store.pipe(
    select(this.entityState),
    map((state) => state.entities)
  );

  entities$(entitySlice?: Enum): Observable<T[]> {
    const slice = entitySlice ?? this.defaultEntitySlice;
    return this.state$.pipe(
      map((entities) => entities[slice]?.list),
      map(
        (entities) => Object.values(entities ?? {}).filter((x) => !!x) as T[]
      ),
      filter((entities) => !!entities)
    );
  }

  entity$(id: string, entitySlice?: Enum): Observable<T> {
    const slice = entitySlice ?? this.defaultEntitySlice;
    return this.state$.pipe(
      map((entities) => entities[slice]?.list[id] as T),
      filter((entity) => !!entity)
    );
  }

  getEntities(entitySlice?: Enum): Observable<T[]> {
    const slice = entitySlice ?? this.defaultEntitySlice;
    return this.dispatchAction$<T[], {
      pageSize: number;
      page: number;
      sortedColumn: string;
      sortDirection: string;
      resetPaging: boolean;
    }>(getEntities<T>(slice.toString()), {
      pageSize: 0,
      page: 0,
      sortedColumn: '',
      sortDirection: '',
      resetPaging: false,
    });
  }

  getEntitiesPaged(
    pageSize: number,
    page: number,
    sortedColumn: string,
    sortDirection: string,
    resetPaging = false,
    entitySlice?: Enum
  ): Observable<T[]> {
    const slice = entitySlice ?? this.defaultEntitySlice;
    return this.dispatchAction$<T[], {
      pageSize: number;
      page: number;
      sortedColumn: string;
      sortDirection: string;
      resetPaging: boolean;
    }>(getEntities<T>(slice.toString()), {
      pageSize,
      page,
      sortedColumn,
      sortDirection,
      resetPaging,
    });
  }

  getEntity(entitiyId: string, entitySlice?: Enum): Observable<T> {
    const slice = entitySlice ?? this.defaultEntitySlice;
    return this.dispatchAction$<T, { entitiyId: string }>(getEntity<T>(slice.toString()), {
      entitiyId,
    });
  }

  addEntity(entity: T, entitySlice?: Enum): Observable<T> {
    const slice = entitySlice ?? this.defaultEntitySlice;
    entity.id ??= v4();
    return this.dispatchAction$<T, { entity: T }>(addEntity<T>(slice.toString()), {
      entity: entity,
    });
  }

  updateEntity(entity: T, entitySlice?: Enum): Observable<T> {
    const slice = entitySlice ?? this.defaultEntitySlice;
    return this.dispatchAction$<T, { entity: T }>(updateEntity<T>(slice.toString()), {
      entity: entity,
    });
  }

  removeEntity(entityId: string, entitySlice?: Enum): Observable<boolean> {
    const slice = entitySlice ?? this.defaultEntitySlice;
    return this.dispatchAction$<boolean, { entityId: string }>(deleteEntity(slice.toString()), {
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
