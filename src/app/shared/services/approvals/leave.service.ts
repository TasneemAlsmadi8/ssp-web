import { Injectable } from '@angular/core';
import { GenericApprovalService } from './generic-approval.service';
import { LeaveApproval } from '../../interfaces/approvals/leave';
import { Observable, map, tap } from 'rxjs';
import { User } from '../../interfaces/user';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { BaseService } from '../../base/base.service';
import { ApprovalAction } from '../../interfaces/approvals/shared';
import { formatTimeToHHmm } from '../../utils/data-formatter';

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
  }
  getAll(): Observable<LeaveApproval[]> {
    const url = `${this.url}/GetLeaveRequestForApproval?EmployeeId=${this.user.id}&UILang=??`; //TODO: check the UILang param (note: this works)
    return this.http.get<LeaveApproval[]>(url, this.httpOptions).pipe(
      tap((leaveApprovals) => {
        leaveApprovals.map((value) => {
          value.fromTime = formatTimeToHHmm(value.fromTime ?? '0000');
          value.toTime = formatTimeToHHmm(value.toTime ?? '0000');
        });
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
            .filter((req) => req.leaveID !== id);
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
            .filter((req) => req.leaveID !== id);
          this.leaveApprovalsStore.update(updatedLeaveRequests);
        }
      })
    );
  }
}
