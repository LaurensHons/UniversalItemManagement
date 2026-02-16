import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityService } from './entity.service';
import { FieldProperty } from '../models/field-property.model';

@Injectable({
  providedIn: 'root',
})
export class FieldPropertyService extends EntityService<FieldProperty> {
  constructor(http: HttpClient) {
    super(http, 'FieldProperty', FieldProperty);
  }
}
