import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityService } from './entity.service';
import { UTask } from '../models/utask.model';

@Injectable({
  providedIn: 'root',
})
export class UtaskService extends EntityService<UTask> {
  constructor(http: HttpClient) {
    super(http, 'Utask', UTask);
  }
}
