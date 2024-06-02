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
  endpoint = '/SSPLogin/SSPLogin';
  url = this.baseUrl + this.endpoint;
  constructor(
    private http: HttpClient,
    private localUserService: LocalUserService
  ) {
    super();
  }

  login(user: UserLogin): Observable<EmployeeResponse> {
    return this.http
      .post<EmployeeResponse>(this.url, user, this.httpOptions)
      .pipe(
        tap((employee) => {
          this.localUserService.setUserFromEmployee(employee);
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
