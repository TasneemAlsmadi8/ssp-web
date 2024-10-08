import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  ValueTransactionRequest,
  ValueTransactionRequestType,
  ValueTransactionRequestUpdate,
  ValueTransactionRequestAdd,
  ValueTransactionRequestApi,
  ValueTransactionRequestAddApi,
  ValueTransactionRequestUpdateApi,
} from '../../interfaces/requests/value-transaction';
import { Observable, map, tap } from 'rxjs';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { GenericRequestService } from './generic-request.service';
import { formatDateToISO } from '../../utils/data-formatter';
import { ItemStatus, ItemStatusString } from '../../interfaces/generic-item';

type iValueTransactionRequestService = GenericRequestService<
  ValueTransactionRequest,
  ValueTransactionRequestUpdate,
  ValueTransactionRequestAdd,
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
  get list$(): Observable<ValueTransactionRequest[]> {
    return this.valueTransactionRequestsStore.observable$;
  }

  private valueTransactionTypesStore: SharedArrayStore<ValueTransactionRequestType> =
    new SharedArrayStore<ValueTransactionRequestType>();

  private endpoint = '/ValueTranRequest';
  private url = this.baseUrl + this.endpoint;

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();

    this.valueTransactionRequestsStore.setDefaultSortByKey('id', false);
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(): Observable<ValueTransactionRequest[]> {
    const url = `${this.url}/GetValueTranRequestsByEmployeeID?EmployeeId=${this.user.id}`;
    return this.http
      .get<ValueTransactionRequestApi[]>(url, this.httpOptions)
      .pipe(
        map((response) =>
          response.map(ValueTransactionRequestAdapter.apiToModel)
        ),
        tap((valueTransactionRequests) =>
          this.valueTransactionRequestsStore.update(valueTransactionRequests)
        )
      );
  }

  cancel(id: string): Observable<any> {
    const url = `${this.url}/UpdateValueTranRequest`;
    const request = this.valueTransactionRequestsStore.find((v) => v.id === id);
    const body: ValueTransactionRequestUpdateApi = {
      docEntry: id,
      u_Status: ItemStatus.Canceled,
      u_EmployeeID: this.user.id,
      u_Date: request?.date.replaceAll('-', ''),
    };

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedValueTransactionRequests =
          this.valueTransactionRequestsStore
            .getValue()
            .map((valueTransactionRequest) => {
              if (valueTransactionRequest.id === id) {
                valueTransactionRequest.status = 'Canceled';
                valueTransactionRequest = { ...valueTransactionRequest };
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
          // console.log(value);
          this.valueTransactionTypesStore.update(value);
        });
    }
    return this.valueTransactionTypesStore.observable$;
  }

  update(
    data: ValueTransactionRequestUpdate,
    employeeId?: string
  ): Observable<any> {
    if (!employeeId) employeeId = this.user.id;
    const url = this.url + '/UpdateValueTranRequest';

    const body = ValueTransactionRequestAdapter.updateToApi(data, employeeId);
    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedValueTransactionRequests =
          this.valueTransactionRequestsStore
            .getValue()
            .map((valueTransactionRequest) => {
              if (valueTransactionRequest.id === data.id) {
                valueTransactionRequest = {
                  ...valueTransactionRequest,
                  ...data,
                  status: 'Pending',
                };
              }
              return valueTransactionRequest;
            });
        this.valueTransactionRequestsStore.update(
          updatedValueTransactionRequests
        );
      })
    );
  }

  add(data: ValueTransactionRequestAdd): Observable<any> {
    const url = this.url + '/AddValueTranRequest';

    const body = ValueTransactionRequestAdapter.addToApi(data, this.user.id);
    return this.http.post<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        this.getAll().subscribe();
      })
    );
  }
}

class ValueTransactionRequestAdapter {
  static apiToModel(
    apiSchema: ValueTransactionRequestApi
  ): ValueTransactionRequest {
    const obj: ValueTransactionRequest = {
      id: apiSchema.valueTranID,
      valueTranName: apiSchema.valueTranName,
      valueTranCode: apiSchema.valueTranCode,
      value: parseFloat(apiSchema.value),
      date: formatDateToISO(apiSchema.date),
      createDate: formatDateToISO(apiSchema.createDate),
      projectCode: apiSchema.projectCode,
      status: (apiSchema.status || 'Pending') as ItemStatusString,
      remarks: apiSchema.remarks,
    };
    return obj;
  }

  static addToApi(
    addSchema: ValueTransactionRequestAdd,
    employeeId: string
  ): ValueTransactionRequestAddApi {
    const obj: ValueTransactionRequestAddApi = {
      u_EmployeeID: employeeId,
      u_ValueTranType: addSchema.valueTranCode,
      u_TranValue: addSchema.value.toString(),
      u_Date: addSchema.date.replaceAll('-', ''),
      u_ProjectCode: addSchema.projectCode,
      u_Remarks: addSchema.remarks,
    };
    return obj;
  }

  static updateToApi(
    updateSchema: ValueTransactionRequestUpdate,
    employeeId: string
  ): ValueTransactionRequestUpdateApi {
    const obj: ValueTransactionRequestUpdateApi = {
      docEntry: updateSchema.id,
      u_EmployeeID: employeeId,
      u_ValueTranType: updateSchema.valueTranCode,
      u_TranValue: updateSchema.value?.toString(),
      u_Date: updateSchema.date?.replaceAll('-', ''),
      u_ProjectCode: updateSchema.projectCode,
      u_Remarks: updateSchema.remarks,
      u_Status: ItemStatus.Pending,
    };
    return obj;
  }
}
