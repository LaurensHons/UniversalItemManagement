import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { FieldValue } from 'src/app/core/models/field-value.model';
import { FieldValueService } from 'src/app/core/services/field-value.service';
import { EntityEffects } from '../base/entity.effects';
import { EntityFacade } from '../base/entity.facade';
import { entitiesReducer, EntityState } from '../base/entity.reducer';
import { CoreFeature } from '../core.feature';

export const FieldValueFeatureKey = 'FieldValueFeature';

export enum FieldValueEntities {
  FieldValue = 'FieldValue',
}

export interface FieldValueState extends EntityState<FieldValueEntities> {}

export function FieldValueReducer(state: FieldValueState | undefined, action: Action) {
  return entitiesReducer<FieldValue, FieldValueEntities>(
    Object.keys(FieldValueEntities) as FieldValueEntities[]
  )(state, action);
}

@Injectable({
  providedIn: 'root',
})
export class FieldValueEntityEffects extends EntityEffects<FieldValue, FieldValueEntities> {
  constructor(actions$: Actions, repo: FieldValueService) {
    super(actions$, repo, FieldValueEntities.FieldValue);
  }
}

@Injectable({
  providedIn: 'root',
})
export class FieldValueFacade extends EntityFacade<FieldValue, FieldValueEntities> {
  constructor(_store: Store<CoreFeature>) {
    super(_store, FieldValueFeatureKey, FieldValueEntities.FieldValue);
  }
}
