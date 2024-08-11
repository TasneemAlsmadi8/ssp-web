import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  LeaveRequest,
  LeaveRequestType,
  LeaveRequestUpdate,
  LeaveRequestAdd,
  LeaveRequestBalance,
  LeaveRequestApi,
  LeaveRequestAddApi,
  LeaveRequestUpdateApi,
} from '../../interfaces/requests/leave';
import { Observable, map, tap } from 'rxjs';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { GenericRequestService } from './generic-request.service';
import { formatDateToISO, formatTimeToHHmm } from '../../utils/data-formatter';
import { ItemStatus, ItemStatusString } from '../../interfaces/generic-item';

type iLeaveRequestService = GenericRequestService<
  LeaveRequest,
  LeaveRequestUpdate,
  LeaveRequestAdd,
  LeaveRequestType
>;

@Injectable({
  providedIn: 'root',
})
export class LeaveRequestService
  extends BaseService
  implements iLeaveRequestService
{
  private leaveRequestsStore = new SharedArrayStore<LeaveRequest>();
  get list$(): Observable<LeaveRequest[]> {
    return this.leaveRequestsStore.observable$;
  }

  private leaveTypesStore: SharedArrayStore<LeaveRequestType> =
    new SharedArrayStore<LeaveRequestType>();

  private endpoint = '/LeaveRequest';
  private url = this.baseUrl + this.endpoint;

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();

    this.leaveRequestsStore.setDefaultSortByKeys([
      { key: 'id', ascending: false },
    ]);
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(): Observable<LeaveRequest[]> {
    const url = `${this.url}/GetLeaveRequestsByEmployeeId?EmployeeId=${this.user.id}`;
    return this.http.get<LeaveRequestApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(LeaveRequestAdapter.apiToModel)),
      tap((leaveRequests) => this.leaveRequestsStore.update(leaveRequests))
    );
  }

  cancel(id: string): Observable<any> {
    const url = `${this.url}/UpdateLeaveRequest`;
    const request = this.leaveRequestsStore.find((v) => v.id === id);
    const body: LeaveRequestUpdateApi = {
      docEntry: id,
      u_EmployeeID: this.user.id,
      u_Status: ItemStatus.Canceled,
      u_FromDate: request?.fromDate.replaceAll('-', ''),
    };

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedLeaveRequests = this.leaveRequestsStore
          .getValue()
          .map((leaveRequest) => {
            if (leaveRequest.id === id) {
              leaveRequest.status = 'Canceled';
              // leaveRequest.statusTypeId = body.u_Status;
              // leaveRequest.u_Status = body.u_Status;
              leaveRequest = { ...leaveRequest };
            }
            return leaveRequest;
          });
        this.leaveRequestsStore.update(updatedLeaveRequests);
      })
    );
  }

  getTypes(): Observable<LeaveRequestType[]> {
    if (this.leaveTypesStore.getValue().length == 0) {
      this.getTypesByEmployeeId(this.user.id).subscribe((value) => {
        value.unshift({ code: '', name: '- select -' });
        this.leaveTypesStore.update(value);
      });
    }
    return this.leaveTypesStore.observable$;
  }

  getTypesByEmployeeId(id: string): Observable<LeaveRequestType[]> {
    const url = this.url + `/GetEmployeeLeaveTypes?EmployeeID=${id}`;
    return this.http.get<LeaveRequestType[]>(url, this.httpOptions);
  }

  update(data: LeaveRequestUpdate, employeeId?: string): Observable<any> {
    if (!employeeId) employeeId = this.user.id;
    const url = this.url + '/UpdateLeaveRequest';
    const body: LeaveRequestUpdateApi = LeaveRequestAdapter.updateToApi(
      data,
      employeeId
    );

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedLeaveRequests = this.leaveRequestsStore
          .getValue()
          .map((leaveRequest) => {
            if (leaveRequest.id === data.id) {
              const leaveType =
                this.getTypeName(data.leaveCode ?? '') ||
                leaveRequest.leaveType;
              leaveRequest = {
                ...leaveRequest,
                ...data,
                leaveType,
                status: 'Pending',
              };
            }
            return leaveRequest;
          });
        this.leaveRequestsStore.update(updatedLeaveRequests);
      })
    );
  }

  add(data: LeaveRequestAdd): Observable<any> {
    const url = this.url + '/AddLeave';

    const body: LeaveRequestAddApi = LeaveRequestAdapter.addToApi(
      data,
      this.user.id
    );

    return this.http.post<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        this.getAll().subscribe();
      })
    );
  }

  getBalance(
    leaveCode: string,
    fromDate: string // yyyy-mm-dd
  ): Observable<LeaveRequestBalance[]> {
    const url =
      this.url +
      `/GetEmployeeLeaveBalance?EmpCode=${this.user.code}&LeaveCode=${leaveCode}&Date=${fromDate}`;
    return this.http.get<LeaveRequestBalance[]>(url, this.httpOptions);
  }

  getLeaveDays(
    leaveCode: string,
    fromDate: string,
    toDate: string,
    fromTime: string,
    toTime: string
  ): Observable<number[]> {
    fromDate = fromDate.replaceAll('-', '');
    toDate = toDate.replaceAll('-', '');
    fromTime = fromTime.replaceAll(':', '');
    toTime = toTime.replaceAll(':', '');
    const url = `${this.url}/GetLeaveDays?EmpCode=${
      this.user.code
    }&EmployeeID=${
      this.user.id
    }&LeaveCode=${leaveCode}&FromDate=${fromDate}&ToDate=${toDate}&FromTime=${encodeURIComponent(
      fromTime
    )}&ToTime=${encodeURIComponent(toTime)}`;
    return this.http
      .get(url, { responseType: 'text' })
      .pipe(map((value) => value.split(',').map(Number)));
  }

  private getTypeName(code: string): string {
    const type = this.leaveTypesStore.find((value) => value.code === code);
    if (!type) throw new Error('Invalid leave type code');
    return type?.name;
  }

  sortByDate(ascending: boolean = true): void {
    this.leaveRequestsStore.sortByKey('fromDate', ascending);
  }
  sortById(ascending: boolean = true): void {
    this.leaveRequestsStore.sortByKey('id', ascending);
  }
}

class LeaveRequestAdapter {
  static apiToModel(apiSchema: LeaveRequestApi): LeaveRequest {
    const obj: LeaveRequest = {
      id: apiSchema.leaveID,
      leaveType: apiSchema.leaveType,
      leaveCode: apiSchema.leaveCode,
      fromDate: formatDateToISO(apiSchema.fromDate),
      toDate: formatDateToISO(apiSchema.toDate),
      fromTime: formatTimeToHHmm(apiSchema.fromTime ?? '00:00'),
      toTime: formatTimeToHHmm(apiSchema.toTime ?? '00:00'),
      status: apiSchema.status as ItemStatusString,
      remarks: apiSchema.remarks ?? '',
      paidDays: parseFloat(apiSchema.u_PaidDays),
      unpaidDays: parseFloat(apiSchema.u_UnpaidDays),
    };
    return obj;
  }

  static addToApi(
    addSchema: LeaveRequestAdd,
    employeeId: string
  ): LeaveRequestAddApi {
    const obj: LeaveRequestAddApi = {
      u_EmployeeID: employeeId,
      u_LeaveType: addSchema.leaveCode,
      u_FromDate: addSchema.fromDate.replaceAll('-', ''),
      u_ToDate: addSchema.toDate.replaceAll('-', ''),
      u_FromTime: addSchema.fromTime,
      u_ToTime: addSchema.toTime,
      u_Remarks: addSchema.remarks,
    };
    return obj;
  }

  static updateToApi(
    updateSchema: LeaveRequestUpdate,
    employeeId: string
  ): LeaveRequestUpdateApi {
    const obj: LeaveRequestUpdateApi = {
      docEntry: updateSchema.id,
      u_EmployeeID: employeeId,
      u_LeaveType: updateSchema.leaveCode,
      u_FromDate: updateSchema.fromDate?.replaceAll('-', ''),
      u_ToDate: updateSchema.toDate?.replaceAll('-', ''),
      u_FromTime: updateSchema.fromTime,
      u_ToTime: updateSchema.toTime,
      u_Remarks: updateSchema.remarks,
      u_Status: ItemStatus.Pending,
    };
    return obj;
  }
}
