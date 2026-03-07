import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityService } from './entity.service';
import { ListItem } from '../models/item-list.model';

@Injectable({
  providedIn: 'root',
})
export class ListItemService extends EntityService<ListItem> {
  constructor(http: HttpClient) {
    super(http, 'ListItem', ListItem);
  }
}
