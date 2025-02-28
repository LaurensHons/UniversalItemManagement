import {
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SignalRService } from './signal.service';

@Injectable()
export class ConnectionIdMiddleware implements HttpInterceptor {
  constructor(
    protected router: Router,
    protected signalRService: SignalRService
  ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log(req, this.signalRService.connection);
    if (
      !this.signalRService.connection ||
      !this.signalRService.connection.connectionId
    )
      return next.handle(req);
    return next.handle(
      req.clone({
        setHeaders: {
          SRConnectionID: this.signalRService.connection.connectionId,
        },
      })
    );
  }
}
