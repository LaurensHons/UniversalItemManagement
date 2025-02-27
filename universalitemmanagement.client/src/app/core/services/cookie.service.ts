// import { Injectable } from '@angular/core';
// import { CookieService as AngularCookieService } from 'ngx-cookie-service';
// import { BehaviorSubject, Observable, Subject } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class CookieService {
//   constructor(private cookieService: AngularCookieService) {}

//   cookieObservables: { [key: string]: BehaviorSubject<string | undefined> } =
//     {};

//   setCookie(name: string, value: string) {
//     this.cookieService.set(name, value);
//     if (this.cookieObservables[name]) this.cookieObservables[name].next(value);
//     else
//       this.cookieObservables[name] = new BehaviorSubject<string | undefined>(
//         undefined
//       );
//   }

//   getCookie(name: string) {
//     if (this.cookieObservables[name]) return this.cookieObservables[name].value;
//     var value = this.cookieService.get(name);
//     this.cookieObservables[name] = new BehaviorSubject<string | undefined>(
//       value
//     );
//     return value;
//   }

//   deleteCookie(name: string) {
//     this.cookieService.delete(name);
//     if (this.cookieObservables[name])
//       this.cookieObservables[name].next(undefined);
//   }

//   observeCookie(name: string): Observable<string | undefined> {
//     if (!this.cookieObservables[name])
//       this.cookieObservables[name] = new BehaviorSubject<string | undefined>(
//         this.cookieService.get(name)
//       );
//     return this.cookieObservables[name].asObservable();
//   }
// }
