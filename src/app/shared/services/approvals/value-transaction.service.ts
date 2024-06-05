import { Injectable } from '@angular/core';
import { GenericApprovalService } from './generic-approval.service';
import {
  ValueTransactionApproval,
  ValueTransactionApprovalApi,
} from '../../interfaces/approvals/value-transaction';
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
export class ValueTransactionApprovalService
  extends BaseService
  implements GenericApprovalService<ValueTransactionApproval>
{
  private valueTransactionApprovalsStore =
    new SharedArrayStore<ValueTransactionApproval>();
  private endpoint = '/ValueTranRequestApproval';
  private url = this.baseUrl + this.endpoint;

  get list$(): Observable<ValueTransactionApproval[]> {
    return this.valueTransactionApprovalsStore.observable$;
  }

  get user(): User {
    return this.userService.getUser();
  }

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();
    this.valueTransactionApprovalsStore.setDefaultSortByKeys([
      { key: 'id', ascending: false },
    ]);
  }
  getAll(): Observable<ValueTransactionApproval[]> {
    const url = `${this.url}/GetValueTranRequestForApproval?EmployeeId=${this.user.id}&UILang=??`; //TODO: check the UILang param (note: this works)
    return this.http
      .get<ValueTransactionApprovalApi[]>(url, this.httpOptions)
      .pipe(
        map((response) =>
          response.map(ValueTransactionApprovalAdapter.apiToModel)
        ),
        tap((valueTransactionApprovals) => {
          this.valueTransactionApprovalsStore.update(valueTransactionApprovals);
        })
      );
  }
  approve(id: string): Observable<boolean> {
    const url =
      `${this.url}/UpdateValueTranRequestByApprover?` +
      `ApproverID=${this.user.id}&ValueTranID=${id}&ActionType=${ApprovalAction.Accepted}`;
    return this.http.post(url, '', { responseType: 'text' }).pipe(
      map((value) => value === 'Request Approved'),
      tap((value) => {
        if (value) {
          const updatedValueTransactionRequests =
            this.valueTransactionApprovalsStore
              .getValue()
              .filter((req) => req.id !== id);
          this.valueTransactionApprovalsStore.update(
            updatedValueTransactionRequests
          );
        }
      })
    );
  }
  reject(id: string): Observable<boolean> {
    const url =
      `${this.url}/UpdateValueTranRequestByApprover?` +
      `ApproverID=${this.user.id}&ValueTranID=${id}&ActionType=${ApprovalAction.Rejected}`;
    return this.http.post(url, '', { responseType: 'text' }).pipe(
      map((value) => value === 'Request Rejected'),
      tap((value) => {
        if (value) {
          const updatedValueTransactionRequests =
            this.valueTransactionApprovalsStore
              .getValue()
              .filter((req) => req.id !== id);
          this.valueTransactionApprovalsStore.update(
            updatedValueTransactionRequests
          );
        }
      })
    );
  }
}

class ValueTransactionApprovalAdapter {
  static apiToModel(
    apiSchema: ValueTransactionApprovalApi
  ): ValueTransactionApproval {
    const obj: ValueTransactionApproval = {
      dateSubmitted: formatDateToISO(apiSchema.dateSubmitted),
      date: formatDateToISO(apiSchema.date),
      id: apiSchema.valueTranID,
      employeeId: apiSchema.empID,
      employeeCode: apiSchema.empCode,
      fullName: apiSchema.fullName,
      fullNameF: apiSchema.fullNameF,
      valueTranCode: apiSchema.valueTranCode,
      valueTranName: apiSchema.valueTranName,
      value: apiSchema.value,
      status: apiSchema.status,
      remarks: apiSchema.remarks,
      projectCode: apiSchema.projectCode,
      projectName: apiSchema.projectName,
    };
    return obj;
  }
}
