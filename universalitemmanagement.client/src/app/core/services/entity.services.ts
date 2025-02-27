import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityService } from './entity.service';
import { Record } from '../models/record.model';

@Injectable({
  providedIn: 'root',
})
export class RecordService extends EntityService<Record> {
  constructor(http: HttpClient) {
    super(http, 'Record', Record);
  }
}
