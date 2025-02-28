import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, map, Observable } from 'rxjs';
import { Entity } from '../models/entity';

export const GetLocalOrigin = () => `${location.origin.split(':')[1]}:7070`;

@Injectable({
  providedIn: 'root',
})
export abstract class EntityService<T extends Entity> {
  constructor(
    private http: HttpClient,
    public tableName: string,
    private ctor: { new (type: any): T }
  ) {}

  base = GetLocalOrigin() + '/api';

  getEntities(
    pageSize: number,
    page: number,
    sortedColumn: string,
    sortDirection: string,
    resetPaging: boolean
  ): Observable<T[]> {
    return this.http.get<T[]>(`${this.base}/${this.tableName}`).pipe(
      first(),
      map((result) => result.map((entity) => new this.ctor(entity)))
    );
  }

  getEntityById(entityId: string): Observable<T> {
    return this.http.get<T>(`${this.base}/${this.tableName}/${entityId}`).pipe(
      first(),
      map((entity) => new this.ctor(entity))
    );
  }

  AddEntity(entity: T): Observable<T> {
    return this.http.post<T>(`${this.base}/${this.tableName}`, entity).pipe(
      first(),
      map((entity) => new this.ctor(entity))
    );
  }

  UpdateEntity(entity: T): Observable<T> {
    return this.http.patch<T>(`${this.base}/${this.tableName}`, entity).pipe(
      first(),
      map((entity) => new this.ctor(entity))
    );
  }

  DeleteEntityById(entityId: string): Observable<boolean> {
    return this.http
      .delete<boolean>(`${this.base}/${this.tableName}/${entityId}`)
      .pipe(first());
  }
}
