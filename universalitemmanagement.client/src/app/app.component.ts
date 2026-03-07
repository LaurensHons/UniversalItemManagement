import { Component } from '@angular/core';
import { SignalRService } from './core/domain/signals/signal.service';
import {
  addEntitiesResolved,
  updateEntitiesResolved,
  deleteEntitiesResolved,
} from './core/domain/store/base/entity.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private signalRService: SignalRService) {}

  ngOnInit(): void {
    this.InitSignalRObservers();
  }

  InitSignalRObservers() {
    this.signalRService.subscribeToTopic('Record', {
      AddEntities: {
        action: addEntitiesResolved('Record'),
        props: (entities) => ({ entities }),
      },
      UpdateEntities: {
        action: updateEntitiesResolved('Record'),
        props: (entities) => ({ entities }),
      },
      DeleteEntities: {
        action: deleteEntitiesResolved('Record'),
        props: (entityIds) => ({ entityIds }),
      },
    });

    this.signalRService.subscribeToTopic('Field', {
      AddEntities: {
        action: addEntitiesResolved('Field'),
        props: (entities) => ({ entities }),
      },
      UpdateEntities: {
        action: updateEntitiesResolved('Field'),
        props: (entities) => ({ entities }),
      },
      DeleteEntities: {
        action: deleteEntitiesResolved('Field'),
        props: (entityIds) => ({ entityIds }),
      },
    });

    this.signalRService.subscribeToTopic('FieldProperty', {
      AddEntities: {
        action: addEntitiesResolved('FieldProperty'),
        props: (entities) => ({ entities }),
      },
      UpdateEntities: {
        action: updateEntitiesResolved('FieldProperty'),
        props: (entities) => ({ entities }),
      },
      DeleteEntities: {
        action: deleteEntitiesResolved('FieldProperty'),
        props: (entityIds) => ({ entityIds }),
      },
    });

    this.signalRService.subscribeToTopic('FieldValue', {
      AddEntities: {
        action: addEntitiesResolved('FieldValue'),
        props: (entities) => ({ entities }),
      },
      UpdateEntities: {
        action: updateEntitiesResolved('FieldValue'),
        props: (entities) => ({ entities }),
      },
      DeleteEntities: {
        action: deleteEntitiesResolved('FieldValue'),
        props: (entityIds) => ({ entityIds }),
      },
    });

    this.signalRService.subscribeToTopic('ItemList', {
      AddEntities: {
        action: addEntitiesResolved('ItemList'),
        props: (entities) => ({ entities }),
      },
      UpdateEntities: {
        action: updateEntitiesResolved('ItemList'),
        props: (entities) => ({ entities }),
      },
      DeleteEntities: {
        action: deleteEntitiesResolved('ItemList'),
        props: (entityIds) => ({ entityIds }),
      },
    });
  }
}
