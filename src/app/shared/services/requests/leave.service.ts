import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  LeaveRequestStatus,
  LeaveRequest,
  LeaveRequestType,
  LeaveRequestUpdateSchema,
  LeaveRequestAddSchema,
  LeaveRequestBalance,
} from '../../interfaces/requests/leave';
import { Observable, tap } from 'rxjs';
import { SharedArrayStore } from '../../utils/shared-array-store';

@Injectable({
  providedIn: 'root',
})
export class LeaveRequestService extends BaseService {
  private leaveRequestsStore = new SharedArrayStore<LeaveRequest>();
  get leaveRequests$(): Observable<LeaveRequest[]> {
    return this.leaveRequestsStore.observable$;
  }

  private leaveTypesStore: SharedArrayStore<LeaveRequestType> =
    new SharedArrayStore<LeaveRequestType>();

  private endpoint = '/LeaveRequest';
  private url = this.baseUrl + this.endpoint;

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();

    this.leaveRequestsStore.setDefaultSortByKeys([
      { key: 'sortFromDate', ascending: false },
      { key: 'leaveID', ascending: false },
    ]);
  }

  get user() {
    return this.userService.getUser();
  }

  getLeaveRequests(): Observable<LeaveRequest[]> {
    const url = `${this.url}/GetLeaveRequestsByEmployeeId?EmployeeId=${this.user.id}`;
    return this.http
      .get<LeaveRequest[]>(url, this.httpOptions)
      .pipe(
        tap((leaveRequests) => this.leaveRequestsStore.update(leaveRequests))
      );
  }

  cancelLeaveRequest(id: string): Observable<any> {
    const url = `${this.url}/UpdateLeaveRequest`;
    const body = {
      docEntry: id,
      u_Status: LeaveRequestStatus.Canceled.toString(),
    };

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedLeaveRequests = this.leaveRequestsStore
          .getValue()
          .map((leaveRequest) => {
            if (leaveRequest.leaveID === id) {
              leaveRequest.status = 'Canceled';
              leaveRequest.statusTypeId = body.u_Status;
              leaveRequest.u_Status = body.u_Status;
            }
            return leaveRequest;
          });
        this.leaveRequestsStore.update(updatedLeaveRequests);
      })
    );
  }

  getLeaveTypes(): Observable<LeaveRequestType[]> {
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

  updateLeaveRequest(body: LeaveRequestUpdateSchema): Observable<any> {
    const url = this.url + '/UpdateLeaveRequest';

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedLeaveRequests = this.leaveRequestsStore
          .getValue()
          .map((leaveRequest) => {
            if (leaveRequest.leaveID === body.docEntry) {
              leaveRequest.leaveType =
                this.getLeaveTypeName(body.u_LeaveType ?? '') ||
                leaveRequest.leaveType;
              leaveRequest.fromTime = body.u_FromTime ?? leaveRequest.fromTime;
              leaveRequest.toTime = body.u_ToTime ?? leaveRequest.toTime;
              leaveRequest.fromDate = body.u_FromDate ?? leaveRequest.fromDate;
              leaveRequest.toDate = body.u_ToDate ?? leaveRequest.toDate;
              leaveRequest.remarks = body.u_Remarks ?? leaveRequest.remarks;
            }
            return leaveRequest;
          });
        this.leaveRequestsStore.update(updatedLeaveRequests);
      })
    );
  }

  addLeaveRequest(body: LeaveRequestAddSchema): Observable<any> {
    const url = this.url + '/AddLeave';

    if (!body.u_EmployeeID) body.u_EmployeeID = this.user.id;

    return this.http.post<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        this.getLeaveRequests().subscribe();
      })
    );
  }

  getLeaveBalance(
    leaveCode: string,
    fromDate: string // yyyy-mm-dd
  ): Observable<LeaveRequestBalance[]> {
    const url =
      this.url +
      `/GetEmployeeLeaveBalance?EmpCode=${this.user.code}&LeaveCode=${leaveCode}&Date=${fromDate}`;
    return this.http.get<LeaveRequestBalance[]>(url, this.httpOptions);
  }

  private getLeaveTypeName(code: string): string {
    return (
      this.leaveTypesStore.getValue().find((value) => value.code === code)
        ?.name ?? ''
    );
  }

  sortByDate(ascending: boolean = true): void {
    this.leaveRequestsStore.sortByKey('fromDate', ascending);
  }
  sortById(ascending: boolean = true): void {
    this.leaveRequestsStore.sortByKey('leaveID', ascending);
  }
}
