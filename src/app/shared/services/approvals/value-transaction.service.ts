import { Injectable } from '@angular/core';
import { GenericApprovalService } from './generic-approval.service';
import { ValueTransactionApproval } from '../../interfaces/approvals/value-transaction';
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
      { key: 'valueTranID', ascending: false },
    ]);
  }
  getAll(): Observable<ValueTransactionApproval[]> {
    const url = `${this.url}/GetValueTranRequestForApproval?EmployeeId=${this.user.id}&UILang=??`; //TODO: check the UILang param (note: this works)
    return this.http
      .get<ValueTransactionApproval[]>(url, this.httpOptions)
      .pipe(
        tap((valueTransactionApprovals) => {
          // valueTransactionApprovals.map((value) => {
          //   value.startDate = value.startDate.slice(0, 10);
          // });
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
              .filter((req) => req.valueTranID !== id);
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
              .filter((req) => req.valueTranID !== id);
          this.valueTransactionApprovalsStore.update(
            updatedValueTransactionRequests
          );
        }
      })
    );
  }
}
