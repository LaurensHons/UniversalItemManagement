import { Component } from '@angular/core';
import { SignalRService } from './core/domain/signals/signal.service';
import { addEntityResolved } from './core/domain/store/base/entity.actions';
import { RecordEntities } from './core/domain/store/record/record.state';
import { Entity } from './core/models/entity';

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
      AddEntities: {},
      UpdateEntities: {},
      DeleteEntities: {},
    });
  }
}
