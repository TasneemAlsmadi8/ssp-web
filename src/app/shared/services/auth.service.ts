import { Injectable } from '@angular/core';
import { ChangePassword, UserLogin } from '../interfaces/user';
import { EmployeeInfo } from '../interfaces/Employee';
import { BaseService } from '../base/base.service';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LocalUserService } from './local-user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  endpoint = '/SSPLogin';
  url = this.baseUrl + this.endpoint;
  constructor(
    private http: HttpClient,
    private localUserService: LocalUserService
  ) {
    super();
  }

  login(user: UserLogin): Observable<EmployeeInfo> {
    const url = `${this.url}/SSPLogin`;
    return this.http.post<EmployeeInfo>(url, user, this.httpOptions).pipe(
      tap((employee) => {
        this.localUserService.setUserFromEmployee(employee);
      })
    );
  }

  logout(): void {
    this.localUserService.removeUser();
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const url = `${this.url}/ChangePassword`;
    const body: ChangePassword = {
      employeeID: this.localUserService.getUser().id,
      oldPassword: oldPassword,
      newPassword: newPassword,
    };

    return this.http.patch<any>(url, body, this.httpOptions);
  }

  checkLogin(): Observable<boolean> {
    const isUserLoggedIn = this.localUserService.checkLogin();
    return new Observable<boolean>((subscriber) => {
      subscriber.next(isUserLoggedIn);
      subscriber.complete();
    });
  }
}
