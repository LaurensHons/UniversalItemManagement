import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Field } from 'src/app/core/models/field.model';
import { FieldService } from 'src/app/core/services/field.service';
import { EntityEffects } from '../base/entity.effects';
import { EntityFacade } from '../base/entity.facade';
import { entitiesReducer, EntityState } from '../base/entity.reducer';
import { CoreFeature } from '../core.feature';

export const FieldFeatureKey = 'FieldFeature';

export enum FieldEntities {
  Field = 'Field',
}

export interface FieldState extends EntityState<FieldEntities> {}

export function FieldReducer(state: FieldState | undefined, action: Action) {
  return entitiesReducer<Field, FieldEntities>(
    Object.keys(FieldEntities) as FieldEntities[]
  )(state, action);
}

@Injectable({
  providedIn: 'root',
})
export class FieldEntityEffects extends EntityEffects<Field, FieldEntities> {
  constructor(actions$: Actions, repo: FieldService) {
    super(actions$, repo, FieldEntities.Field);
  }
}

@Injectable({
  providedIn: 'root',
})
export class FieldFacade extends EntityFacade<Field, FieldEntities> {
  constructor(_store: Store<CoreFeature>) {
    super(_store, FieldFeatureKey, FieldEntities.Field);
  }
}
