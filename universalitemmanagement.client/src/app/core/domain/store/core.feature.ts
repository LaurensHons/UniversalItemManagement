import { Inject, InjectionToken } from '@angular/core';

import { ActionReducerMap } from '@ngrx/store';
import { ENITTY_REDUCER_FACTORY } from './base/entity.reducer';
import {
  RecordFeatureKey,
  RecordState,
  RecordReducer,
  RecordEntityEffects,
} from './record/record.state';
import {
  FieldPropertyFeatureKey,
  FieldPropertyState,
  FieldPropertyReducer,
  FieldPropertyEntityEffects,
} from './fields/field-property.state';
import { FieldFeatureKey, FieldReducer, FieldState, FieldEntityEffects } from './fields/field.state';

export const featureKey = 'coreFeature';

export interface CoreState {
  [RecordFeatureKey]: RecordState;
  [FieldFeatureKey]: FieldState;
  [FieldPropertyFeatureKey]: FieldPropertyState;
}

export const reducers = new InjectionToken<ActionReducerMap<CoreState>>(
  featureKey,
  {
    factory: () => ({
      [RecordFeatureKey]: RecordReducer,
      [FieldFeatureKey]: FieldReducer,
      [FieldPropertyFeatureKey]: FieldPropertyReducer,
    }),
  }
);

export const effects = [RecordEntityEffects, FieldEntityEffects, FieldPropertyEntityEffects];

export interface CoreFeature {
  [featureKey]: CoreState;
}
