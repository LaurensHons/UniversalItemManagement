import { Injectable, isDevMode } from '@angular/core';
import { first, Observable } from 'rxjs';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';
import { Entity } from '../../models/entity';
import { CoreFeature } from '../store/core.feature';
import { ActionCreator, Store } from '@ngrx/store';
import { Action, TypedAction } from '@ngrx/store/src/models';
import { ActionBase } from '../store/base/action-base.interface';
import { act } from '@ngrx/effects';
import {
  addEntitiesResolved,
  addEntityResolved,
  deleteEntitiesResolved,
  updateEntitiesResolved,
} from '../store/base/entity.actions';
import { environment } from '../../../../environments/environment';

export enum OperationType {
  ADD = 'AddEntities',
  PATCH = 'UpdateEntities',
  DELETE = 'DeleteEntities',
}

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  connection!: HubConnection;

  constructor(private store: Store<CoreFeature>) {}

  initConnection() {
    let builder = new HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        transport: signalR.HttpTransportType.WebSockets,
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect();

    if (isDevMode())
      builder = builder.configureLogging(signalR.LogLevel.Information);

    this.connection = builder.build();
    this.connection.start().catch((err) => console.error(err));
  }

  subscribeToTopic<T extends Entity, R, P>(
    entitySlice: string,
    actions: {
      [key in OperationType]?: {
        action?: ActionCreator<
          string,
          (
            props: P & ActionBase<R>
          ) => (P & ActionBase<R>) & TypedAction<string>
        >;
        props?: (data: T[] | string[]) => P;
      };
    },
    destroy?: Observable<void>
  ): void {
    if (!this.connection) this.initConnection();

    if (actions.AddEntities)
      this.connection.on('AddEntities', (topic, entities: T[]) => {
        if (entitySlice !== topic) return;
        if (!actions.AddEntities?.action)
          this.dispatchAction$(addEntitiesResolved(entitySlice), {
            entities: entities as Entity[],
          }).subscribe();
        else
          this.dispatchAction$(
            actions.AddEntities!.action,
            actions.AddEntities!.props!(entities)
          ).subscribe();
      });

    if (actions.UpdateEntities)
      this.connection.on('UpdateEntities', (topic, entities: T[]) => {
        if (entitySlice !== topic) return;
        if (!actions.UpdateEntities?.action)
          this.dispatchAction$(updateEntitiesResolved(entitySlice), {
            entities: entities as Entity[],
          }).subscribe();
        else
          this.dispatchAction$(
            actions.UpdateEntities!.action,
            actions.UpdateEntities!.props!(entities)
          ).subscribe();
      });

    if (actions.DeleteEntities)
      this.connection.on('DeleteEntities', (topic, entityIds: string[]) => {
        if (entitySlice !== topic) return;
        if (!actions.DeleteEntities?.action)
          this.dispatchAction$(deleteEntitiesResolved(entitySlice), {
            entityIds: entityIds,
          }).subscribe();
        else
          this.dispatchAction$(
            actions.DeleteEntities!.action,
            actions.DeleteEntities!.props!(entityIds)
          ).subscribe();
      });
  }

  private dispatchAction$<R, P>(
    action: ActionCreator<
      string,
      (props: P & ActionBase<R>) => (P & ActionBase<R>) & TypedAction<string>
    >,
    props?: P
  ) {
    return new Observable<R>((subscriber) => {
      this.store.dispatch(
        action({
          callback: (value: R) => {
            subscriber.next(value);
            subscriber.complete();
          },
          error: (e: Error) => {
            subscriber.error(e);
            subscriber.complete();
          },
          ...props,
        } as P & ActionBase<R>) as Action
      );
    });
  }
}
