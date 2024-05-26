import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  ValueTransactionRequestStatus,
  ValueTransactionRequest,
  ValueTransactionRequestType,
  ValueTransactionRequestUpdateSchema,
  ValueTransactionRequestAddSchema,
} from '../../interfaces/requests/value-transaction';
import { Observable, tap } from 'rxjs';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { GenericRequestService } from './generic-request.service';

type iValueTransactionRequestService = GenericRequestService<
  ValueTransactionRequest,
  ValueTransactionRequestUpdateSchema,
  ValueTransactionRequestAddSchema,
  ValueTransactionRequestType
>;

@Injectable({
  providedIn: 'root',
})
export class ValueTransactionRequestService
  extends BaseService
  implements iValueTransactionRequestService
{
  private valueTransactionRequestsStore =
    new SharedArrayStore<ValueTransactionRequest>();
  get items$(): Observable<ValueTransactionRequest[]> {
    return this.valueTransactionRequestsStore.observable$;
  }

  private valueTransactionTypesStore: SharedArrayStore<ValueTransactionRequestType> =
    new SharedArrayStore<ValueTransactionRequestType>();

  private endpoint = '/ValueTranRequest';
  private url = this.baseUrl + this.endpoint;

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();

    this.valueTransactionRequestsStore.setDefaultSortByKey(
      'valueTranID',
      false
    );
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(): Observable<ValueTransactionRequest[]> {
    const url = `${this.url}/GetValueTranRequestsByEmployeeID?EmployeeId=${this.user.id}`;
    return this.http
      .get<ValueTransactionRequest[]>(url, this.httpOptions)
      .pipe(
        tap((valueTransactionRequests) =>
          this.valueTransactionRequestsStore.update(valueTransactionRequests)
        )
      );
  }

  cancel(id: string): Observable<any> {
    const url = `${this.url}/UpdateValueTranRequest`;
    const body = {
      docEntry: id,
      u_Status: ValueTransactionRequestStatus.Canceled.toString(),
    };

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedValueTransactionRequests =
          this.valueTransactionRequestsStore
            .getValue()
            .map((valueTransactionRequest) => {
              if (valueTransactionRequest.valueTranID === id) {
                valueTransactionRequest.status = 'Canceled';
                valueTransactionRequest.u_Status = body.u_Status;
              }
              return valueTransactionRequest;
            });
        this.valueTransactionRequestsStore.update(
          updatedValueTransactionRequests
        );
      })
    );
  }

  getTypes(): Observable<ValueTransactionRequestType[]> {
    if (this.valueTransactionTypesStore.getValue().length == 0) {
      const url = this.url + `/GetValueTransactionTypes`;
      this.http
        .get<ValueTransactionRequestType[]>(url, this.httpOptions)
        .subscribe((value) => {
          console.log(value);
          this.valueTransactionTypesStore.update(value);
        });
    }
    return this.valueTransactionTypesStore.observable$;
  }

  update(body: ValueTransactionRequestUpdateSchema): Observable<any> {
    const url = this.url + '/UpdateValueTranRequest';

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedValueTransactionRequests =
          this.valueTransactionRequestsStore
            .getValue()
            .map((valueTransactionRequest) => {
              if (valueTransactionRequest.valueTranID === body.docEntry) {
                console.log('sync updated values');
                valueTransactionRequest.valueTranCode =
                  body.u_ValueTranType ?? valueTransactionRequest.valueTranCode;
                valueTransactionRequest.value =
                  body.u_TranValue ?? valueTransactionRequest.value;
                valueTransactionRequest.date =
                  body.u_Date ?? valueTransactionRequest.date;
                valueTransactionRequest.projectCode =
                  body.u_ProjectCode ?? valueTransactionRequest.projectCode;
                valueTransactionRequest.remarks =
                  body.u_Remarks ?? valueTransactionRequest.remarks;
              }
              return valueTransactionRequest;
            });
        this.valueTransactionRequestsStore.update(
          updatedValueTransactionRequests
        );
      })
    );
  }

  add(body: ValueTransactionRequestAddSchema): Observable<any> {
    const url = this.url + '/AddValueTranRequest';

    if (!body.u_EmployeeID) body.u_EmployeeID = this.user.id;

    return this.http.post<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        this.getAll().subscribe();
      })
    );
  }

  // getValueTransactionTypeName(code: string): string {
  //   return (
  //     this.valueTransactionTypesStore.getValue().find((value) => value.code === code)
  //       ?.name ?? ''
  //   );
  // }

  // sortByDate(ascending: boolean = true): void {
  //   this.valueTransactionRequestsStore.sortByKey('fromDate', ascending);
  // }
  // sortById(ascending: boolean = true): void {
  //   this.valueTransactionRequestsStore.sortByKey('valueTransactionID', ascending);
  // }
}
