import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  LoanRequestStatus,
  LoanRequest,
  LoanRequestType,
  LoanRequestUpdateSchema,
  LoanRequestAddSchema,
} from '../../interfaces/requests/loan';
import { Observable, tap } from 'rxjs';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { GenericRequestService } from './generic-request.service';

type iLoanRequestService = GenericRequestService<
  LoanRequest,
  LoanRequestUpdateSchema,
  LoanRequestAddSchema,
  LoanRequestType
>;

@Injectable({
  providedIn: 'root',
})
export class LoanRequestService
  extends BaseService
  implements iLoanRequestService
{
  private loanRequestsStore = new SharedArrayStore<LoanRequest>();
  get list$(): Observable<LoanRequest[]> {
    return this.loanRequestsStore.observable$;
  }

  private loanTypesStore: SharedArrayStore<LoanRequestType> =
    new SharedArrayStore<LoanRequestType>();

  private endpoint = '/LoanRequest';
  private url = this.baseUrl + this.endpoint;

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();

    this.loanRequestsStore.setDefaultSortByKey('loanID', false);
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(): Observable<LoanRequest[]> {
    const url = `${this.url}/GetLoan?EmployeeId=${this.user.id}`;
    return this.http
      .get<LoanRequest[]>(url, this.httpOptions)
      .pipe(tap((loanRequests) => this.loanRequestsStore.update(loanRequests)));
  }

  cancel(id: string): Observable<any> {
    const url = `${this.url}/UpdateLoanRequest`;
    const body = {
      docEntry: id,
      u_Status: LoanRequestStatus.Canceled.toString(),
    };

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedLoanRequests = this.loanRequestsStore
          .getValue()
          .map((loanRequest) => {
            if (loanRequest.loanID === id) {
              loanRequest.status = 'Canceled';
              loanRequest.statusID = body.u_Status;
              loanRequest = { ...loanRequest };
            }
            return loanRequest;
          });
        this.loanRequestsStore.update(updatedLoanRequests);
      })
    );
  }

  getTypes(): Observable<LoanRequestType[]> {
    if (this.loanTypesStore.getValue().length == 0) {
      const url = this.url + '/GetLoanTypes';
      this.http
        .get<LoanRequestType[]>(url, this.httpOptions)
        .subscribe((value) => {
          this.loanTypesStore.update(value);
        });
    }
    return this.loanTypesStore.observable$;
  }

  update(body: LoanRequestUpdateSchema): Observable<any> {
    const url = this.url + '/UpdateLoanRequest';

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedLoanRequests = this.loanRequestsStore
          .getValue()
          .map((loanRequest) => {
            if (loanRequest.loanID === body.docEntry) {
              loanRequest.loanCode = body.u_LoanType ?? loanRequest.loanCode;
              loanRequest.totalAmount =
                body.u_TotalAmount ?? loanRequest.totalAmount;
              loanRequest.installmentCount =
                body.u_InstallmentCount ?? loanRequest.installmentCount;
              loanRequest.startDate = body.u_StartDate ?? loanRequest.startDate;
              loanRequest.remarks = body.u_Remarks ?? loanRequest.remarks;
              loanRequest = { ...loanRequest };
            }
            return loanRequest;
          });
        this.loanRequestsStore.update(updatedLoanRequests);
      })
    );
  }

  add(body: LoanRequestAddSchema): Observable<any> {
    const url = this.url + '/AddLoanRequest';

    if (!body.u_EmployeeID) body.u_EmployeeID = parseInt(this.user.id);

    return this.http.post<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        this.getAll().subscribe();
      })
    );
  }

  // getLoanBalance(
  //   loanCode: string,
  //   fromDate: string // yyyy-mm-dd
  // ): Observable<LoanRequestBalance[]> {
  //   const url =
  //     this.url +
  //     `/GetEmployeeLoanBalance?EmpCode=${this.user.code}&LoanCode=${loanCode}&Date=${fromDate}`;
  //   return this.http.get<LoanRequestBalance[]>(url, this.httpOptions);
  // }

  // getLoanTypeName(code: string): string {
  //   return (
  //     this.loanTypesStore.getValue().find((value) => value.code === code)
  //       ?.name ?? ''
  //   );
  // }

  // sortByDate(ascending: boolean = true): void {
  //   this.loanRequestsStore.sortByKey('fromDate', ascending);
  // }
  // sortById(ascending: boolean = true): void {
  //   this.loanRequestsStore.sortByKey('loanID', ascending);
  // }
}
