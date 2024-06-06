import { Injectable } from '@angular/core';
import { GenericApprovalService } from './generic-approval.service';
import {
  OvertimeApproval,
  OvertimeApprovalApi,
} from '../../interfaces/approvals/overtime';
import { Observable, map, tap } from 'rxjs';
import { User } from '../../interfaces/user';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { BaseService } from '../../base/base.service';
import { ApprovalAction } from '../../interfaces/approvals/shared';
import { formatDateToISO } from '../../utils/data-formatter';
import { ItemStatusString } from '../../interfaces/generic-item';

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
      { key: 'id', ascending: false },
    ]);
  }
  getAll(): Observable<OvertimeApproval[]> {
    const url = `${this.url}/GetOvertimeRequestForApproval?EmployeeId=${this.user.id}&UILang=??`; //TODO: check the UILang param (note: this works)
    return this.http.get<OvertimeApprovalApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(OvertimeApprovalAdapter.apiToModel)),
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
            .filter((req) => req.id !== id);
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
            .filter((req) => req.id !== id);
          this.overtimeApprovalsStore.update(updatedOvertimeRequests);
        }
      })
    );
  }
}

class OvertimeApprovalAdapter {
  static apiToModel(apiSchema: OvertimeApprovalApi): OvertimeApproval {
    const obj: OvertimeApproval = {
      dateSubmitted: formatDateToISO(apiSchema.dateSubmitted),
      fromDate: formatDateToISO(apiSchema.fromDate),
      id: apiSchema.overtimeID,
      employeeId: apiSchema.empID,
      employeeCode: apiSchema.empCode,
      fullName: apiSchema.fullName,
      fullNameF: apiSchema.fullNameF,
      overtimeCode: apiSchema.overtimeCode,
      overtimeType: apiSchema.overtimeType,
      hour: parseFloat(apiSchema.ovHour),
      minute: parseFloat(apiSchema.ovMin),
      status: apiSchema.status as ItemStatusString,
      remarks: apiSchema.remarks,
      projectCode: apiSchema.projectCode,
      projectName: apiSchema.projectName,
    };
    return obj;
  }
}
