import { Injectable } from '@angular/core';
import { GenericApprovalService } from './generic-approval.service';
import { OvertimeApproval } from '../../interfaces/approvals/overtime';
import { Observable, map, tap } from 'rxjs';
import { User } from '../../interfaces/user';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { BaseService } from '../../base/base.service';
import { ApprovalAction } from '../../interfaces/approvals/shared';

@Injectable({
  providedIn: 'root',
})
export class OvertimeApprovalService
  extends BaseService
  implements GenericApprovalService<OvertimeApproval>
{
  private overtimeApprovalsStore = new SharedArrayStore<OvertimeApproval>();
  private endpoint = '/OvertimeRequestApproval';
  private url = this.baseUrl + this.endpoint;

  get list$(): Observable<OvertimeApproval[]> {
    return this.overtimeApprovalsStore.observable$;
  }

  get user(): User {
    return this.userService.getUser();
  }

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();
    this.overtimeApprovalsStore.setDefaultSortByKeys([
      { key: 'overtimeID', ascending: false },
    ]);
  }
  getAll(): Observable<OvertimeApproval[]> {
    const url = `${this.url}/GetOvertimeRequestForApproval?EmployeeId=${this.user.id}&UILang=??`; //TODO: check the UILang param (note: this works)
    return this.http.get<OvertimeApproval[]>(url, this.httpOptions).pipe(
      tap((overtimeApprovals) => {
        overtimeApprovals.map((value) => {
          value.fromDate = value.fromDate.slice(0, 10);
          value.dateSubmitted = value.dateSubmitted.slice(0, 10);
        });
        this.overtimeApprovalsStore.update(overtimeApprovals);
      })
    );
  }
  approve(id: string): Observable<boolean> {
    const url =
      `${this.url}/UpdateOvertimeRequestByApprover?` +
      `ApproverID=${this.user.id}&OvertimeID=${id}&ActionType=${ApprovalAction.Accepted}`;
    return this.http.post(url, '', { responseType: 'text' }).pipe(
      map((value) => value === 'Request Approved'),
      tap((value) => {
        if (value) {
          const updatedOvertimeRequests = this.overtimeApprovalsStore
            .getValue()
            .filter((req) => req.overtimeID !== id);
          this.overtimeApprovalsStore.update(updatedOvertimeRequests);
        }
      })
    );
  }
  reject(id: string): Observable<boolean> {
    const url =
      `${this.url}/UpdateOvertimeRequestByApprover?` +
      `ApproverID=${this.user.id}&OvertimeID=${id}&ActionType=${ApprovalAction.Rejected}`;
    return this.http.post(url, '', { responseType: 'text' }).pipe(
      map((value) => value === 'Request Rejected'),
      tap((value) => {
        if (value) {
          const updatedOvertimeRequests = this.overtimeApprovalsStore
            .getValue()
            .filter((req) => req.overtimeID !== id);
          this.overtimeApprovalsStore.update(updatedOvertimeRequests);
        }
      })
    );
  }
}
