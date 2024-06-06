import { Injectable } from '@angular/core';
import { GenericApprovalService } from './generic-approval.service';
import {
  LeaveApproval,
  LeaveApprovalApi,
} from '../../interfaces/approvals/leave';
import { Observable, map, tap } from 'rxjs';
import { User } from '../../interfaces/user';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { BaseService } from '../../base/base.service';
import { ApprovalAction } from '../../interfaces/approvals/shared';
import { formatDateToISO, formatTimeToHHmm } from '../../utils/data-formatter';
import { ItemStatusString } from '../../interfaces/generic-item';

@Injectable({
  providedIn: 'root',
})
export class LeaveApprovalService
  extends BaseService
  implements GenericApprovalService<LeaveApproval>
{
  private leaveApprovalsStore = new SharedArrayStore<LeaveApproval>();
  private endpoint = '/LeaveRequestApproval';
  private url = this.baseUrl + this.endpoint;

  get list$(): Observable<LeaveApproval[]> {
    return this.leaveApprovalsStore.observable$;
  }

  get user(): User {
    return this.userService.getUser();
  }

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();
    this.leaveApprovalsStore.setDefaultSortByKeys([
      { key: 'id', ascending: false },
    ]);
  }
  getAll(): Observable<LeaveApproval[]> {
    const url = `${this.url}/GetLeaveRequestForApproval?EmployeeId=${this.user.id}&UILang=??`; //TODO: check the UILang param (note: this works)
    return this.http.get<LeaveApprovalApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(LeaveApprovalAdapter.apiToModel)),
      tap((leaveApprovals) => {
        this.leaveApprovalsStore.update(leaveApprovals);
      })
    );
  }
  approve(id: string): Observable<boolean> {
    const url =
      `${this.url}/UpdateLeaveRequestByApprover?` +
      `ApproverID=${this.user.id}&LeaveID=${id}&ActionType=${ApprovalAction.Accepted}`;
    return this.http.post(url, '', { responseType: 'text' }).pipe(
      map((value) => value === 'Request Approved'),
      tap((value) => {
        if (value) {
          const updatedLeaveRequests = this.leaveApprovalsStore
            .getValue()
            .filter((req) => req.id !== id);
          this.leaveApprovalsStore.update(updatedLeaveRequests);
        }
      })
    );
  }
  reject(id: string): Observable<boolean> {
    const url =
      `${this.url}/UpdateLeaveRequestByApprover?` +
      `ApproverID=${this.user.id}&LeaveID=${id}&ActionType=${ApprovalAction.Rejected}`;
    return this.http.post(url, '', { responseType: 'text' }).pipe(
      map((value) => value === 'Request Rejected'),
      tap((value) => {
        if (value) {
          const updatedLeaveRequests = this.leaveApprovalsStore
            .getValue()
            .filter((req) => req.id !== id);
          this.leaveApprovalsStore.update(updatedLeaveRequests);
        }
      })
    );
  }
}

class LeaveApprovalAdapter {
  static apiToModel(apiSchema: LeaveApprovalApi): LeaveApproval {
    const obj: LeaveApproval = {
      id: apiSchema.leaveID,
      leaveType: apiSchema.leaveType,
      leaveCode: apiSchema.leaveCode,
      fromDate: formatDateToISO(apiSchema.fromDate),
      toDate: formatDateToISO(apiSchema.toDate),
      fromTime: formatTimeToHHmm(apiSchema.fromTime ?? '0000'),
      toTime: formatTimeToHHmm(apiSchema.toTime ?? '0000'),
      status: apiSchema.status as ItemStatusString,
      remarks: apiSchema.remarks,
      dateSubmitted: formatDateToISO(apiSchema.dateSubmitted),
      employeeId: apiSchema.empID,
      employeeCode: apiSchema.empCode,
      fullName: apiSchema.fullName,
      fullNameF: apiSchema.fullName,
      leaveBalance: parseFloat(apiSchema.leaveBalance),
    };
    return obj;
  }
}
