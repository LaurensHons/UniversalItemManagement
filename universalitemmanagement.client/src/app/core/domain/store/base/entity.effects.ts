import { inject, Inject, Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  EffectSources,
  FunctionalEffect,
  ofType,
} from '@ngrx/effects';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import {
  addEntity,
  addEntityResolved,
  getEntities,
  getEntitiesResolved,
  getEntity,
  getEntityResolved,
  deleteEntity,
  deleteEntityResolved,
  updateEntity,
  updateEntityResolved,
} from './entity.actions';
import { Entity } from 'src/app/core/models/entity';
import { EntityService } from 'src/app/core/services/entity.service';
import { ActionCreator, Store } from '@ngrx/store';
import { Action, ActionReducerMap, TypedAction } from '@ngrx/store/src/models';
import { ActionBase } from '../base/action-base.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ENITTY_REDUCER_FACTORY,
  entitiesReducer,
  EntityState,
} from './entity.reducer';
import { CoreFeature } from '../core.feature';

@Injectable({ providedIn: 'root' })
export abstract class EntityEffects<T extends Entity, Enum extends string> {
  constructor(
    private actions$: Actions,
    private repo: EntityService<T>,
    private entitySlice: Enum
  ) {
    // this._store.addReducer(this.entityFeatureKey, this.EntityReducer);
  }

  private createDefaultEffect<P, RA extends ResolvedAction<P, any, R>, R>(
    action: ActionCreator<
      string,
      (props: P & ActionBase<R>) => (P & ActionBase<R>) & TypedAction<string>
    >,
    apiObs: (props: P) => Observable<R>,
    resolvedActions: RA | RA[]
  ) {
    return createEffect(
      () =>
        this.actions$.pipe(
          ofType(action),
          switchMap((props) =>
            apiObs(props).pipe(
              tap((value) =>
                props.callback ? props.callback(value) : undefined
              ),
              switchMap((value) =>
                Array.isArray(resolvedActions)
                  ? resolvedActions.map((ra) =>
                      ra.action(ra.valueMapper({ result: value, ...props }))
                    )
                  : ([
                      resolvedActions.action(
                        resolvedActions.valueMapper({ result: value, ...props })
                      ),
                    ] as TypedAction<string>[])
              ),
              catchError((e) => {
                if (props.error) props.error(e);
                return [];
              })
            )
          )
        ),
      { functional: true }
    );
  }

  getEntities = this.createDefaultEffect(
    getEntities(this.entitySlice),
    ({ pageSize, page, sortedColumn, sortDirection, resetPaging }) =>
      this.repo.getEntities(
        pageSize,
        page,
        sortedColumn,
        sortDirection,
        resetPaging
      ),
    {
      valueMapper: ({ result, resetPaging }) => ({
        result,
        totalRecordCount: result.length,
        resetPaging,
      }),
      action: getEntitiesResolved(this.entitySlice),
    }
  );

  getEntity = this.createDefaultEffect(
    getEntity(this.entitySlice),
    ({ entitiyId }) => this.repo.getEntityById(entitiyId),
    {
      valueMapper: ({ result }) => ({ entity: result }),
      action: getEntityResolved(this.entitySlice),
    }
  );

  addEntity = this.createDefaultEffect(
    addEntity(this.entitySlice),
    ({ entity }) => this.repo.AddEntity(entity as T),
    {
      valueMapper: ({ result }) => ({ entity: result }),
      action: addEntityResolved(this.entitySlice),
    }
  );

  updateEntity = this.createDefaultEffect(
    updateEntity<T>(this.entitySlice),
    ({ entity }) => this.repo.UpdateEntity(entity),
    {
      valueMapper: ({ result }) => ({ entity: result }),
      action: updateEntityResolved<T>(this.entitySlice),
    }
  );

  removeEntity = this.createDefaultEffect(
    deleteEntity(this.entitySlice),
    ({ entityId }) => this.repo.DeleteEntityById(entityId),
    {
      valueMapper: ({ entityId, result }) => ({
        entityId,
      }),
      action: deleteEntityResolved(this.entitySlice),
    }
  );
}

type ResolvedAction<P, PR, R> = {
  valueMapper: (v: P & { result: R }) => PR;
  action: ActionCreator<string, (props: PR) => PR & TypedAction<string>>;
};
