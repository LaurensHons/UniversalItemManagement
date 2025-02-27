import { Inject, InjectionToken } from '@angular/core';

import { ActionReducerMap } from '@ngrx/store';
import { ENITTY_REDUCER_FACTORY } from './base-entity/entity.reducer';
import {
  RecordFeatureKey,
  RecordState,
  RecordReducer,
  RecordEntityEffects,
} from './record/record.state';

export const featureKey = 'coreFeature';

export interface CoreState {
  [RecordFeatureKey]: RecordState;
}

export const reducers = new InjectionToken<ActionReducerMap<CoreState>>(
  featureKey,
  {
    factory: () => ({
      [RecordFeatureKey]: RecordReducer,
    }),
  }
);

export const effects = [RecordEntityEffects];

export interface CoreFeature {
  [featureKey]: CoreState;
}
