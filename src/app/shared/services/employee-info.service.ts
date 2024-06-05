import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalUserService } from './local-user.service';
import { BaseService } from '../base/base.service';
import {
  EmployeeInfoUpdate,
  EmployeeInfo,
  EmployeeInfoUpdateApi,
  EmployeeInfoApi,
} from '../interfaces/Employee';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeInfoService extends BaseService {
  private endpoint = '/Employee';
  private url = this.baseUrl + this.endpoint;
  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();
  }

  getEmployeeInfo(): Observable<EmployeeInfo[]> {
    const id = this.userService.getUser().id;
    const url = this.url + `?EmpID=${id}`;
    return this.http
      .get<EmployeeInfoApi[]>(url, this.httpOptions)
      .pipe(map((response) => response.map(EmployeeInfoAdapter.apiToModel)));
  }

  updateEmployeeInfo(data: EmployeeInfoUpdate): Observable<any> {
    const id = this.userService.getUser().id;
    const body = EmployeeInfoAdapter.updateToApi(data, id);

    return this.http.patch<EmployeeInfo[]>(this.url, body, this.httpOptions);
  }
}

class EmployeeInfoAdapter {
  static apiToModel(apiSchema: EmployeeInfoApi): EmployeeInfo {
    const obj: EmployeeInfo = {
      isActive: apiSchema.isActive,
      id: apiSchema.employeeID,
      code: apiSchema.u_EmpCode,
      directManager: apiSchema.directManager,
      startDate: apiSchema.startDate,
      firstName: apiSchema.firstName,
      middleName: apiSchema.middleName,
      lastName: apiSchema.lastName,
      fullName: apiSchema.u_FullName,
      mobilePhone: apiSchema.mobile,
      homePhone: apiSchema.homeTel,
      email: apiSchema.email,
      socialSecurityNo: apiSchema.u_SocialSecurityNo,
      nationalId: apiSchema.u_NationalID,
      incomeTaxNo: apiSchema.u_EmpIncomeTaxNo,
      homeStreet: apiSchema.homeStreet,
      homeBlock: apiSchema.homeBlock,
      homeBuildingFloorRoom: apiSchema.homeBuild,
      homeZipCode: apiSchema.homeZip,
      loginId: apiSchema.loginID,
      managerName: apiSchema.managerName,
      position: apiSchema.position,
      terminationDate: apiSchema.terminationDate,
    };
    return obj;
  }

  static updateToApi(
    updateSchema: EmployeeInfoUpdate,
    employeeId: string
  ): EmployeeInfoUpdateApi {
    const obj: EmployeeInfoUpdateApi = {
      employeeID: employeeId,
      homeBlock: updateSchema.homeBlock,
      homeZipCode: updateSchema.homeZipCode,
      homeStreet: updateSchema.homeStreet,
      homeBuildingFloorRoom: updateSchema.homeBuildingFloorRoom,
      mobilePhone: updateSchema.mobilePhone,
      homePhone: updateSchema.homePhone,
    };
    return obj;
  }
}
