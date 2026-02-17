import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityService } from './entity.service';
import { FieldValue } from '../models/field-value.model';

@Injectable({
  providedIn: 'root',
})
export class FieldValueService extends EntityService<FieldValue> {
  constructor(http: HttpClient) {
    super(http, 'FieldValue', FieldValue);
  }
}
