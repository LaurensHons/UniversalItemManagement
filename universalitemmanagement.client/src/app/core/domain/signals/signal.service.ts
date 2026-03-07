import { Injectable, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';
import { Entity } from '../../models/entity';
import { CoreFeature } from '../store/core.feature';
import { ActionCreator, Store } from '@ngrx/store';
import { Action, TypedAction } from '@ngrx/store/src/models';
import { environment } from '../../../../environments/environment';

interface ActionConfig<TData, TProps> {
  action: ActionCreator<string, (props: TProps) => TProps & TypedAction<string>>;
  props: (data: TData) => TProps;
}

export interface TopicActions<T extends Entity> {
  AddEntities?: ActionConfig<T[], { entities: Entity[] }>;
  UpdateEntities?: ActionConfig<T[], { entities: Entity[] }>;
  DeleteEntities?: ActionConfig<string[], { entityIds: string[] }>;
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

  subscribeToTopic<T extends Entity>(
    entitySlice: string,
    actions: TopicActions<T>,
    destroy?: Observable<void>
  ): void {
    if (!this.connection) this.initConnection();

    if (actions.AddEntities)
      this.connection.on('AddEntities', (topic, entities: T[]) => {
        if (entitySlice !== topic) return;
        this.store.dispatch(
          actions.AddEntities!.action(
            actions.AddEntities!.props(entities)
          ) as Action
        );
      });

    if (actions.UpdateEntities)
      this.connection.on('UpdateEntities', (topic, entities: T[]) => {
        if (entitySlice !== topic) return;
        this.store.dispatch(
          actions.UpdateEntities!.action(
            actions.UpdateEntities!.props(entities)
          ) as Action
        );
      });

    if (actions.DeleteEntities)
      this.connection.on('DeleteEntities', (topic, entityIds: string[]) => {
        if (entitySlice !== topic) return;
        this.store.dispatch(
          actions.DeleteEntities!.action(
            actions.DeleteEntities!.props(entityIds)
          ) as Action
        );
      });
  }

}
