import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  LoanRequest,
  LoanRequestType,
  LoanRequestUpdate,
  LoanRequestAdd,
  LoanRequestApi,
  LoanRequestAddApi,
  LoanRequestUpdateApi,
} from '../../interfaces/requests/loan';
import { Observable, map, tap } from 'rxjs';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { GenericRequestService } from './generic-request.service';
import { formatDateToISO } from '../../utils/data-formatter';
import { ItemStatus, ItemStatusString } from '../../interfaces/generic-item';

type iLoanRequestService = GenericRequestService<
  LoanRequest,
  LoanRequestUpdate,
  LoanRequestAdd,
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

    this.loanRequestsStore.setDefaultSortByKey('id', false);
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(): Observable<LoanRequest[]> {
    const url = `${this.url}/GetLoan?EmployeeId=${this.user.id}`;
    return this.http.get<LoanRequestApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(LoanRequestAdapter.apiToModel)),
      tap((loanRequests) => this.loanRequestsStore.update(loanRequests))
    );
  }

  cancel(id: string): Observable<any> {
    const url = `${this.url}/UpdateLoanRequest`;
    const body = {
      docEntry: id,
      u_Status: ItemStatus.Canceled,
    };

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedLoanRequests = this.loanRequestsStore
          .getValue()
          .map((loanRequest) => {
            if (loanRequest.id === id) {
              loanRequest.status = 'Canceled';
              // loanRequest.statusID = body.u_Status;
              loanRequest = { ...loanRequest };
            }
            return loanRequest;
          });
        this.loanRequestsStore.update(updatedLoanRequests);
      })
    );
  }

  getTypes(): Observable<LoanRequestType[]> {
    if (this.loanTypesStore.isEmpty()) {
      const url = this.url + '/GetLoanTypes';
      this.http
        .get<LoanRequestType[]>(url, this.httpOptions)
        .subscribe((value) => {
          this.loanTypesStore.update(value);
        });
    }
    return this.loanTypesStore.observable$;
  }

  update(data: LoanRequestUpdate): Observable<any> {
    const url = this.url + '/UpdateLoanRequest';
    const body: LoanRequestUpdateApi = LoanRequestAdapter.updateToApi(data);

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedLoanRequests = this.loanRequestsStore
          .getValue()
          .map((loanRequest) => {
            if (loanRequest.id === data.id) {
              loanRequest = { ...loanRequest, ...data, status: 'Pending' };
            }
            return loanRequest;
          });
        this.loanRequestsStore.update(updatedLoanRequests);
      })
    );
  }

  add(data: LoanRequestAdd): Observable<any> {
    const url = this.url + '/AddLoanRequest';
    const body: LoanRequestAddApi = LoanRequestAdapter.addToApi(
      data,
      this.user.id
    );
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
  //   this.loanRequestsStore.sortByKey('id', ascending);
  // }
}

class LoanRequestAdapter {
  static apiToModel(apiSchema: LoanRequestApi): LoanRequest {
    const obj: LoanRequest = {
      id: apiSchema.loanID,
      dateSubmitted:
        apiSchema.dateSubmitted && formatDateToISO(apiSchema.dateSubmitted),
      loanCode: apiSchema.loanCode,
      fullName: apiSchema.fullName,
      fullNameF: apiSchema.fullNameF,
      loanName: apiSchema.loanName,
      totalAmount: parseFloat(apiSchema.totalAmount),
      installmentCount: parseInt(apiSchema.installmentCount),
      startDate: formatDateToISO(apiSchema.startDate),
      status: apiSchema.status as ItemStatusString,
      remarks: apiSchema.remarks ?? '',
    };
    return obj;
  }

  static addToApi(
    addSchema: LoanRequestAdd,
    employeeId: string
  ): LoanRequestAddApi {
    const obj: LoanRequestAddApi = {
      u_EmployeeID: parseInt(employeeId),
      u_LoanType: addSchema.loanCode,
      u_TotalAmount: addSchema.totalAmount.toString(),
      u_InstallmentCount: addSchema.installmentCount.toString(),
      u_StartDate: addSchema.startDate,
      u_Remarks: addSchema.remarks,
    };
    return obj;
  }

  static updateToApi(updateSchema: LoanRequestUpdate): LoanRequestUpdateApi {
    const obj: LoanRequestUpdateApi = {
      docEntry: updateSchema.id,
      u_LoanType: updateSchema.loanCode,
      u_TotalAmount: updateSchema.totalAmount?.toString(),
      u_InstallmentCount: updateSchema.installmentCount?.toString(),
      u_StartDate: updateSchema.startDate,
      u_Remarks: updateSchema.remarks,
      u_Status: ItemStatus.Pending,
    };
    return obj;
  }
}
