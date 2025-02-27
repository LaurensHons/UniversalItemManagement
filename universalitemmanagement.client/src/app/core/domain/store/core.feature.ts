import { Inject, InjectionToken } from '@angular/core';
import {
  UTaskReducer,
  UTaskState,
  UTaskFeatureKey,
  UTaskEntityEffects,
} from './task/task.state';
import { ActionReducerMap } from '@ngrx/store';
import { ENITTY_REDUCER_FACTORY } from './base-entity/entity.reducer';

export const featureKey = 'coreFeature';

export interface CoreState {
  [UTaskFeatureKey]: UTaskState;
}

export const reducers = new InjectionToken<ActionReducerMap<CoreState>>(
  featureKey,
  {
    factory: () => ({
      [UTaskFeatureKey]: UTaskReducer,
    }),
  }
);

export const effects = [UTaskEntityEffects];

export interface CoreFeature {
  [featureKey]: CoreState;
}
