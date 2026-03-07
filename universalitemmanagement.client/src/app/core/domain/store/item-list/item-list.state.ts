import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { ItemList } from 'src/app/core/models/item-list.model';
import { ItemListService } from 'src/app/core/services/item-list.service';
import { EntityEffects } from '../base/entity.effects';
import { EntityFacade } from '../base/entity.facade';
import { entitiesReducer, EntityState } from '../base/entity.reducer';
import { CoreFeature } from '../core.feature';

export const ItemListFeatureKey = 'ItemListFeature';

export enum ItemListEntities {
  ItemList = 'ItemList',
}

export interface ItemListState extends EntityState<ItemListEntities> {}

export function ItemListReducer(state: ItemListState | undefined, action: Action) {
  return entitiesReducer<ItemList, ItemListEntities>(
    Object.keys(ItemListEntities) as ItemListEntities[]
  )(state, action);
}

@Injectable({
  providedIn: 'root',
})
export class ItemListEntityEffects extends EntityEffects<ItemList, ItemListEntities> {
  constructor(actions$: Actions, repo: ItemListService) {
    super(actions$, repo, ItemListEntities.ItemList);
  }
}

@Injectable({
  providedIn: 'root',
})
export class ItemListFacade extends EntityFacade<ItemList, ItemListEntities> {
  constructor(_store: Store<CoreFeature>) {
    super(_store, ItemListFeatureKey, ItemListEntities.ItemList);
  }
}
