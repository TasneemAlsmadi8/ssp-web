import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalUserService } from './local-user.service';
import { BaseService } from '../base/base.service';
import { EmployeePatch, EmployeeResponse } from '../interfaces/Employee';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeInfoService extends BaseService {
  private endpoint = '/Employee';
  private url = this.baseUrl + this.endpoint;
  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();
  }

  getEmployeeInfo(): Observable<EmployeeResponse[]> {
    const id = this.userService.getUser().id;
    const url = this.url + `?EmpID=${id}`;
    return this.http.get<EmployeeResponse[]>(url, this.httpOptions);
  }

  updateEmployeeInfo(employee: EmployeePatch): Observable<any> {
    const id = this.userService.getUser().id;
    if (!employee.employeeID) employee.employeeID = id;
    return this.http.patch<EmployeeResponse[]>(
      this.url,
      employee,
      this.httpOptions
    );
  }
}
