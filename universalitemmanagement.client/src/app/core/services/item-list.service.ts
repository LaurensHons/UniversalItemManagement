import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityService } from './entity.service';
import { ItemList } from '../models/item-list.model';

@Injectable({
  providedIn: 'root',
})
export class ItemListService extends EntityService<ItemList> {
  constructor(http: HttpClient) {
    super(http, 'ItemList', ItemList);
  }
}
