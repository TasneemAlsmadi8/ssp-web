import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  LeaveRequestStatus,
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
import { formatDateToISO } from '../../utils/data-formatter';

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
      { key: 'fromDate', ascending: false },
      { key: 'id', ascending: false },
    ]);
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(): Observable<LeaveRequest[]> {
    const url = `${this.url}/GetLeaveRequestsByEmployeeId?EmployeeId=${this.user.id}`;
    return this.http.get<LeaveRequestApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(LeaveRequestAdapter.ApiToModel)),
      tap((leaveRequests) => this.leaveRequestsStore.update(leaveRequests))
    );
  }

  cancel(id: string): Observable<any> {
    const url = `${this.url}/UpdateLeaveRequest`;
    const body = {
      docEntry: id,
      u_Status: LeaveRequestStatus.Canceled,
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
      const url =
        this.url + `/GetEmployeeLeaveTypes?EmployeeID=${this.user.id}`;
      this.http
        .get<LeaveRequestType[]>(url, this.httpOptions)
        .subscribe((value) => {
          this.leaveTypesStore.update(value);
        });
    }
    return this.leaveTypesStore.observable$;
  }

  update(data: LeaveRequestUpdate): Observable<any> {
    const url = this.url + '/UpdateLeaveRequest';
    const body: LeaveRequestUpdateApi = LeaveRequestAdapter.updateToApi(data);

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

    const body: LeaveRequestAddApi = LeaveRequestAdapter.AddToApi(
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
    return (
      this.leaveTypesStore.getValue().find((value) => value.code === code)
        ?.name ?? ''
    );
  }

  sortByDate(ascending: boolean = true): void {
    this.leaveRequestsStore.sortByKey('fromDate', ascending);
  }
  sortById(ascending: boolean = true): void {
    this.leaveRequestsStore.sortByKey('id', ascending);
  }
}

class LeaveRequestAdapter {
  static ApiToModel(apiSchema: LeaveRequestApi): LeaveRequest {
    const obj: LeaveRequest = {
      id: apiSchema.leaveID,
      employeeId: apiSchema.u_EmployeeID,
      leaveType: apiSchema.leaveType,
      leaveCode: apiSchema.leaveCode,
      fromDate: formatDateToISO(apiSchema.fromDate),
      toDate: formatDateToISO(apiSchema.toDate),
      fromTime: apiSchema.fromTime,
      toTime: apiSchema.toTime,
      status: apiSchema.status,
      remarks: apiSchema.remarks,
      paidDays: apiSchema.u_PaidDays,
      unpaidDays: apiSchema.u_UnpaidDays,
    };
    return obj;
  }

  static AddToApi(
    addSchema: LeaveRequestAdd,
    employeeId: string
  ): LeaveRequestAddApi {
    const obj: LeaveRequestAddApi = {
      u_EmployeeID: employeeId,
      u_LeaveType: addSchema.leaveCode,
      u_FromDate: addSchema.fromDate,
      u_ToDate: addSchema.toDate,
      u_FromTime: addSchema.fromTime,
      u_ToTime: addSchema.toTime,
      u_Remarks: addSchema.remarks,
    };
    return obj;
  }

  static updateToApi(updateSchema: LeaveRequestUpdate): LeaveRequestUpdateApi {
    const obj: LeaveRequestUpdateApi = {
      docEntry: updateSchema.id,
      u_LeaveType: updateSchema.leaveCode,
      u_FromDate: updateSchema.fromDate,
      u_ToDate: updateSchema.toDate,
      u_FromTime: updateSchema.fromTime,
      u_ToTime: updateSchema.toTime,
      u_Remarks: updateSchema.remarks,
    };
    return obj;
  }
}
