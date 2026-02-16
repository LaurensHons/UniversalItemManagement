import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { FieldPropertyService } from 'src/app/core/services/field-property.service';
import { EntityEffects } from '../base/entity.effects';
import { EntityFacade } from '../base/entity.facade';
import { entitiesReducer, EntityState } from '../base/entity.reducer';
import { CoreFeature } from '../core.feature';

export const FieldPropertyFeatureKey = 'FieldPropertyFeature';

export enum FieldPropertyEntities {
  FieldProperty = 'FieldProperty',
}

export interface FieldPropertyState extends EntityState<FieldPropertyEntities> {}

export function FieldPropertyReducer(state: FieldPropertyState | undefined, action: Action) {
  return entitiesReducer<FieldProperty, FieldPropertyEntities>(
    Object.keys(FieldPropertyEntities) as FieldPropertyEntities[]
  )(state, action);
}

@Injectable({
  providedIn: 'root',
})
export class FieldPropertyEntityEffects extends EntityEffects<FieldProperty, FieldPropertyEntities> {
  constructor(actions$: Actions, repo: FieldPropertyService) {
    super(actions$, repo, FieldPropertyEntities.FieldProperty);
  }
}

@Injectable({
  providedIn: 'root',
})
export class FieldPropertyFacade extends EntityFacade<FieldProperty, FieldPropertyEntities> {
  constructor(_store: Store<CoreFeature>) {
    super(_store, FieldPropertyFeatureKey, FieldPropertyEntities.FieldProperty);
  }
}
