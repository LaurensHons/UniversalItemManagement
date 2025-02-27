import { Injectable } from '@angular/core';
import { Actions, EffectSources } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Record } from 'src/app/core/models/record.model';
import { RecordService } from 'src/app/core/services/entity.services';
import { EntityEffects } from '../base-entity/entity.effects';
import { EntityFacade } from '../base-entity/entity.facade';
import { entitiesReducer, EntityState } from '../base-entity/entity.reducer';
import { CoreFeature } from '../core.feature';

export const RecordFeatureKey = 'RecordFeature';

export enum RecordEntities {
  Record = 'Record',
}

export interface RecordState extends EntityState<RecordEntities> {}

export function RecordReducer(state: RecordState | undefined, action: Action) {
  return entitiesReducer<Record, RecordEntities>(
    Object.keys(RecordEntities) as RecordEntities[]
  )(state, action);
}

@Injectable({
  providedIn: 'root',
})
export class RecordEntityEffects extends EntityEffects<Record, RecordEntities> {
  constructor(actions$: Actions, repo: RecordService) {
    super(actions$, repo, RecordEntities.Record);
  }
}

@Injectable({
  providedIn: 'root',
})
export class RecordFacade extends EntityFacade<Record, RecordEntities> {
  constructor(_store: Store<CoreFeature>) {
    super(_store, RecordFeatureKey);
  }
}
