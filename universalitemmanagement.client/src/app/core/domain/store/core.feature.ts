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
import { FieldValueFeatureKey, FieldValueReducer, FieldValueState, FieldValueEntityEffects } from './fields/field-value.state';

export const featureKey = 'coreFeature';

export interface CoreState {
  [RecordFeatureKey]: RecordState;
  [FieldFeatureKey]: FieldState;
  [FieldPropertyFeatureKey]: FieldPropertyState;
  [FieldValueFeatureKey]: FieldValueState;
}

export const reducers = new InjectionToken<ActionReducerMap<CoreState>>(
  featureKey,
  {
    factory: () => ({
      [RecordFeatureKey]: RecordReducer,
      [FieldFeatureKey]: FieldReducer,
      [FieldPropertyFeatureKey]: FieldPropertyReducer,
      [FieldValueFeatureKey]: FieldValueReducer,
    }),
  }
);

export const effects = [RecordEntityEffects, FieldEntityEffects, FieldPropertyEntityEffects, FieldValueEntityEffects];

export interface CoreFeature {
  [featureKey]: CoreState;
}
