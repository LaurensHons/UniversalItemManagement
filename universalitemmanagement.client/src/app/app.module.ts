import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RecordListComponent } from './components/record-list/record-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreStateModule } from './core/domain/core.state.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ENITTY_REDUCER_FACTORY } from './core/domain/store/base-entity/entity.reducer';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { routes } from './core/app.routes';
import { ConnectionIdMiddleware } from './core/domain/store/signals/connectionId.middleware';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RecordListComponent,
    NgbModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    CoreStateModule,
  ],
  providers: [
    {
      provide: ENITTY_REDUCER_FACTORY,
      useValue: new BehaviorSubject({}),
    },
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ConnectionIdMiddleware,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
