import { InjectionToken } from '@angular/core';
import {
  Action,
  ActionCreator,
  ActionReducer,
  ActionReducerMap,
  createReducer,
  on,
  ReducerTypes,
} from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { Entity } from 'src/app/core/models/entity';
import {
  addEntityResolved,
  getEntitiesResolved,
  getEntityResolved,
  deleteEntityResolved,
  updateEntityResolved,
  addEntitiesResolved,
  updateEntitiesResolved,
  deleteEntitiesResolved,
} from './entity.actions';

export const entityFeatureSlice = 'entitiesSlice';

export const ENITTY_REDUCER_FACTORY = new InjectionToken<
  BehaviorSubject<ActionReducerMap<any, Action>>
>('my.Value.token');

export interface EntityState<T extends string> {
  entities: {
    [key in T]?: {
      list: { [id: string]: Entity };
      totalRecordCount: number;
    };
  };
}

const defaultState = {
  entities: {},
};
export const initialState = <T extends string>(): EntityState<T> =>
  defaultState;

export const entitiesReducer = <E extends Entity, T extends string>(
  entitySlices: T[]
) =>
  createReducer(
    initialState(),
    ...entitySlices.flatMap((s) => entityResolvedActions<T>(s))
  );

export const entityResolvedActions = <T extends string>(
  entitySlice: T
): ReducerTypes<EntityState<T>, readonly ActionCreator[]>[] => [
  on(
    getEntitiesResolved(entitySlice.toString()),
    (state, { result, totalRecordCount, resetPaging }) => ({
      ...state,
      entities: {
        ...state.entities,
        [entitySlice]: {
          ...state.entities[entitySlice],
          list: (resetPaging
            ? [...result]
            : [
                ...Object.values(state.entities[entitySlice]?.list ?? []),
                ...result,
              ]
          ).reduce(
            (r, v, i, a) => ({
              ...r,
              [v.id!]: v,
            }),
            {}
          ),
          totalRecordCount,
        },
      },
    })
  ),
  on(getEntityResolved(entitySlice.toString()), (state, { entity }) => ({
    ...state,
    entities: {
      ...state.entities,
      [entitySlice]: {
        ...state.entities[entitySlice],
        list: {
          ...state.entities[entitySlice]?.list,
          [entity.id!]: entity,
        },
        totalRecordCount: state.entities[entitySlice]?.totalRecordCount ?? 1,
      },
    },
  })),
  on(addEntityResolved(entitySlice.toString()), (state, { entity }) => ({
    ...state,
    entities: {
      ...state.entities,
      [entitySlice]: {
        ...state.entities[entitySlice],
        list: {
          ...state.entities[entitySlice]?.list,
          [entity.id!]: entity,
        },
        totalRecordCount: state.entities[entitySlice]?.totalRecordCount ?? 1,
      },
    },
  })),
  on(addEntitiesResolved(entitySlice.toString()), (state, { entities }) => ({
    ...state,
    entities: {
      ...state.entities,
      [entitySlice]: {
        ...state.entities[entitySlice],
        list: {
          ...state.entities[entitySlice]?.list,
          ...entities.reduce(
            (r, v, i, a) => ({
              ...r,
              [v.id!]: v,
            }),
            {}
          ),
        },
        totalRecordCount: state.entities[entitySlice]?.totalRecordCount ?? 1,
      },
    },
  })),
  on(updateEntityResolved(entitySlice.toString()), (state, { entity }) => ({
    ...state,
    entities: {
      ...state.entities,
      [entitySlice]: {
        ...state.entities[entitySlice],
        list: {
          ...state.entities[entitySlice]?.list,
          [entity.id!]: entity,
        },
        totalRecordCount: state.entities[entitySlice]?.totalRecordCount ?? 1,
      },
    },
  })),
  on(updateEntitiesResolved(entitySlice.toString()), (state, { entities }) => ({
    ...state,
    entities: {
      ...state.entities,
      [entitySlice]: {
        ...state.entities[entitySlice],
        list: {
          ...state.entities[entitySlice]?.list,
          ...entities.reduce(
            (r, v, i, a) => ({
              ...r,
              [v.id!]: v,
            }),
            {}
          ),
        },
        totalRecordCount: state.entities[entitySlice]?.totalRecordCount ?? 1,
      },
    },
  })),
  on(deleteEntityResolved(entitySlice.toString()), (state, { entityId }) => ({
    ...state,
    entities: {
      ...state.entities,
      [entitySlice]: {
        ...state.entities[entitySlice],
        totalRecordCount:
          (state.entities[entitySlice]?.totalRecordCount ?? 1) - 1,
        list: {
          ...state.entities[entitySlice]?.list,
          [entityId]: undefined!,
        },
      },
    },
  })),
  on(
    deleteEntitiesResolved(entitySlice.toString()),
    (state, { entityIds }) => ({
      ...state,
      entities: {
        ...state.entities,
        [entitySlice]: {
          ...state.entities[entitySlice],
          totalRecordCount:
            (state.entities[entitySlice]?.totalRecordCount ?? 1) - 1,
          list: {
            ...state.entities[entitySlice]?.list,
            ...entityIds.reduce(
              (r, v, i, a) => ({
                ...r,
                [v]: undefined!,
              }),
              {}
            ),
          },
        },
      },
    })
  ),
];
