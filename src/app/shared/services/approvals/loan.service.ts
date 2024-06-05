import { Injectable } from '@angular/core';
import { GenericApprovalService } from './generic-approval.service';
import { LoanApproval, LoanApprovalApi } from '../../interfaces/approvals/loan';
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
export class LoanApprovalService
  extends BaseService
  implements GenericApprovalService<LoanApproval>
{
  private loanApprovalsStore = new SharedArrayStore<LoanApproval>();
  private endpoint = '/LoanRequestApproval';
  private url = this.baseUrl + this.endpoint;

  get list$(): Observable<LoanApproval[]> {
    return this.loanApprovalsStore.observable$;
  }

  get user(): User {
    return this.userService.getUser();
  }

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();
    this.loanApprovalsStore.setDefaultSortByKeys([
      { key: 'id', ascending: false },
    ]);
  }
  getAll(): Observable<LoanApproval[]> {
    const url = `${this.url}/GetLoanRequestForApproval?EmployeeId=${this.user.id}&UILang=??`; //TODO: check the UILang param (note: this works)
    return this.http.get<LoanApprovalApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(LoanApprovalAdapter.apiToModel)),
      tap((loanApprovals) => {
        loanApprovals.map((value) => {
          value.startDate = value.startDate.slice(0, 10);
        });
        this.loanApprovalsStore.update(loanApprovals);
      })
    );
  }
  approve(id: string): Observable<boolean> {
    const url =
      `${this.url}/UpdateLoanRequestByApprover?` +
      `ApproverID=${this.user.id}&LoanID=${id}&ActionType=${ApprovalAction.Accepted}`;
    return this.http.post(url, '', { responseType: 'text' }).pipe(
      map((value) => value === 'Request Approved'),
      tap((value) => {
        if (value) {
          const updatedLoanRequests = this.loanApprovalsStore
            .getValue()
            .filter((req) => req.id !== id);
          this.loanApprovalsStore.update(updatedLoanRequests);
        }
      })
    );
  }
  reject(id: string): Observable<boolean> {
    const url =
      `${this.url}/UpdateLoanRequestByApprover?` +
      `ApproverID=${this.user.id}&LoanID=${id}&ActionType=${ApprovalAction.Rejected}`;
    return this.http.post(url, '', { responseType: 'text' }).pipe(
      map((value) => value === 'Request Rejected'),
      tap((value) => {
        if (value) {
          const updatedLoanRequests = this.loanApprovalsStore
            .getValue()
            .filter((req) => req.id !== id);
          this.loanApprovalsStore.update(updatedLoanRequests);
        }
      })
    );
  }
}
class LoanApprovalAdapter {
  static apiToModel(apiSchema: LoanApprovalApi): LoanApproval {
    const obj: LoanApproval = {
      dateSubmitted: apiSchema.dateSubmitted,
      startDate: apiSchema.startDate,
      id: apiSchema.loanID,
      employeeId: apiSchema.empID,
      employeeCode: apiSchema.empCode,
      fullName: apiSchema.fullName,
      fullNameF: apiSchema.fullNameF,
      loanCode: apiSchema.loanCode,
      loanName: apiSchema.loanName,
      totalAmount: apiSchema.totalAmount,
      installmentCount: apiSchema.installmentCount,
      status: apiSchema.status,
      remarks: apiSchema.remarks,
    };
    return obj;
  }
}
