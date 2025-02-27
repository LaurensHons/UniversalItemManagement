import { Injectable } from '@angular/core';
import { Actions, EffectSources } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { UTask } from 'src/app/core/models/utask.model';
import { UtaskService } from 'src/app/core/services/entity.services';
import { EntityEffects } from '../base-entity/entity.effects';
import { EntityFacade } from '../base-entity/entity.facade';
import { entitiesReducer, EntityState } from '../base-entity/entity.reducer';
import { CoreFeature } from '../core.feature';

export const UTaskFeatureKey = 'UTaskFeature';

export enum TaskEntities {
  UTask = 'UTask',
}

export interface UTaskState extends EntityState<TaskEntities> {}

export function UTaskReducer(state: UTaskState | undefined, action: Action) {
  return entitiesReducer<UTask, TaskEntities>(
    Object.keys(TaskEntities) as TaskEntities[]
  )(state, action);
}

@Injectable({
  providedIn: 'root',
})
export class UTaskEntityEffects extends EntityEffects<UTask, TaskEntities> {
  constructor(actions$: Actions, repo: UtaskService) {
    super(actions$, repo, TaskEntities.UTask);
  }
}

@Injectable({
  providedIn: 'root',
})
export class UTaskFacade extends EntityFacade<UTask, TaskEntities> {
  constructor(_store: Store<CoreFeature>) {
    super(_store, UTaskFeatureKey);
  }
}
