import { Injectable } from '@angular/core';
import { User, UserLogin } from '../interfaces/user';
import { EmployeeResponse } from '../interfaces/Employee';
import { BaseService } from '../base/base.service';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of, tap } from 'rxjs';
import { LocalUserService } from './local-user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  constructor(
    private http: HttpClient,
    private localUserService: LocalUserService
  ) {
    super();
  }

  endpoint = '/SSPLogin/SSPLogin';
  url = this.baseUrl + this.endpoint;

  login(user: UserLogin): Observable<EmployeeResponse> {
    // const success = user.username === 'moh' && user.password === '123';

    // if (success) {
    //   this.localUserService.setUser(user);
    //   return of({ success }).pipe(delay(1000));
    // }
    // // Simulate a 1-second delay before emitting the error
    // return new Observable<any>((subscriber) => {
    //   setTimeout(() => subscriber.error('Invalid username or password'), 1000);
    // });

    return this.http
      .post<EmployeeResponse>(this.url, user, this.httpOptions)
      .pipe(
        tap((employee) => {
          this.localUserService.setUserFromEmplyee(employee);
        })
      );
  }

  logout(): void {
    this.localUserService.removeUser();
  }

  checkLogin(): Observable<boolean> {
    const isUserLoggedIn = this.localUserService.checkLogin();
    return new Observable<boolean>((subscriber) => {
      subscriber.next(isUserLoggedIn);
      subscriber.complete();
    });
  }
}
