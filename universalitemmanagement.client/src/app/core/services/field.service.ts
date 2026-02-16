import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityService } from './entity.service';
import { Field } from '../models/field.model';

@Injectable({
  providedIn: 'root',
})
export class FieldService extends EntityService<Field> {
  constructor(http: HttpClient) {
    super(http, 'Field', Field);
  }
}
