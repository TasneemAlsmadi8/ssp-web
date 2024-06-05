import { Injectable } from '@angular/core';
import { GenericApprovalService } from './generic-approval.service';
import {
  EncashmentApproval,
  EncashmentApprovalApi,
} from '../../interfaces/approvals/encashment';
import { Observable, map, tap } from 'rxjs';
import { User } from '../../interfaces/user';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { BaseService } from '../../base/base.service';
import { ApprovalAction } from '../../interfaces/approvals/shared';
import { formatDateToISO, formatTimeToHHmm } from '../../utils/data-formatter';

@Injectable({
  providedIn: 'root',
})
export class EncashmentApprovalService
  extends BaseService
  implements GenericApprovalService<EncashmentApproval>
{
  private encashmentApprovalsStore = new SharedArrayStore<EncashmentApproval>();
  private endpoint = '/EncashRequestApproval';
  private url = this.baseUrl + this.endpoint;

  get list$(): Observable<EncashmentApproval[]> {
    return this.encashmentApprovalsStore.observable$;
  }

  get user(): User {
    return this.userService.getUser();
  }

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();
    this.encashmentApprovalsStore.setDefaultSortByKeys([
      { key: 'id', ascending: false },
    ]);
  }
  getAll(): Observable<EncashmentApproval[]> {
    const url = `${this.url}/GetEncashRequestForApproval?EmployeeId=${this.user.id}&UILang=??`; //TODO: check the UILang param (note: this works)
    return this.http.get<EncashmentApprovalApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(EncashmentApprovalAdapter.apiToModel)),
      tap((encashmentApprovals) => {
        // encashmentApprovals.map((value) => {
        //   value.startDate = value.startDate.slice(0, 10);
        // });
        this.encashmentApprovalsStore.update(encashmentApprovals);
      })
    );
  }
  approve(id: string): Observable<boolean> {
    const url =
      `${this.url}/UpdateEncashRequestByApprover?` +
      `ApproverID=${this.user.id}&EncashID=${id}&ActionType=${ApprovalAction.Accepted}`;
    return this.http.post(url, '', { responseType: 'text' }).pipe(
      map((value) => value === 'Request Approved'),
      tap((value) => {
        if (value) {
          const updatedEncashmentRequests = this.encashmentApprovalsStore
            .getValue()
            .filter((req) => req.id !== id);
          this.encashmentApprovalsStore.update(updatedEncashmentRequests);
        }
      })
    );
  }
  reject(id: string): Observable<boolean> {
    const url =
      `${this.url}/UpdateEncashRequestByApprover?` +
      `ApproverID=${this.user.id}&EncashID=${id}&ActionType=${ApprovalAction.Rejected}`;
    return this.http.post(url, '', { responseType: 'text' }).pipe(
      map((value) => value === 'Request Rejected'),
      tap((value) => {
        if (value) {
          const updatedEncashmentRequests = this.encashmentApprovalsStore
            .getValue()
            .filter((req) => req.id !== id);
          this.encashmentApprovalsStore.update(updatedEncashmentRequests);
        }
      })
    );
  }
}

class EncashmentApprovalAdapter {
  static apiToModel(apiSchema: EncashmentApprovalApi): EncashmentApproval {
    const obj: EncashmentApproval = {
      dateSubmitted: formatDateToISO(apiSchema.dateSubmitted),
      date: formatDateToISO(apiSchema.date),
      id: apiSchema.encashID,
      employeeId: apiSchema.empID,
      employeeCode: apiSchema.empCode,
      fullName: apiSchema.fullName,
      fullNameF: apiSchema.fullNameF,
      encashCode: apiSchema.encashCode,
      encashName: apiSchema.encashName,
      unitCount: apiSchema.unitCount,
      value: apiSchema.value,
      status: apiSchema.status,
      remarks: apiSchema.remarks,
      projectCode: apiSchema.projectCode,
      projectName: apiSchema.projectName,
    };
    return obj;
  }
}
