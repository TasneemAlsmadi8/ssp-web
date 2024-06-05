import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  EncashmentRequestStatus,
  EncashmentRequest,
  EncashmentRequestType,
  EncashmentRequestUpdate,
  EncashmentRequestAdd,
  EncashmentValue,
  EncashmentRequestApi,
  EncashmentRequestAddApi,
  EncashmentRequestUpdateApi,
} from '../../interfaces/requests/encashment';
import { Observable, map, tap } from 'rxjs';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { GenericRequestService } from './generic-request.service';
import {
  formatDateToDisplay,
  formatDateToISO,
} from '../../utils/data-formatter';

type iEncashmentRequestService = GenericRequestService<
  EncashmentRequest,
  EncashmentRequestUpdate,
  EncashmentRequestAdd,
  EncashmentRequestType
>;

@Injectable({
  providedIn: 'root',
})
export class EncashmentRequestService
  extends BaseService
  implements iEncashmentRequestService
{
  private encashmentRequestsStore = new SharedArrayStore<EncashmentRequest>();
  get list$(): Observable<EncashmentRequest[]> {
    return this.encashmentRequestsStore.observable$;
  }

  private encashmentTypesStore: SharedArrayStore<EncashmentRequestType> =
    new SharedArrayStore<EncashmentRequestType>();

  private endpoint = '/EncashRequest';
  private url = this.baseUrl + this.endpoint;

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();

    this.encashmentRequestsStore.setDefaultSortByKey('id', false);
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(): Observable<EncashmentRequest[]> {
    const url = `${this.url}/GetEncash?EmployeeId=${this.user.id}`;
    return this.http.get<EncashmentRequestApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(EncashmentRequestAdapter.apiToModel)),
      tap((encashmentRequests) =>
        this.encashmentRequestsStore.update(encashmentRequests)
      )
    );
  }

  cancel(id: string): Observable<any> {
    //TODO: Check why does not work
    const url = `${this.url}/UpdateEncashRequest`;
    const body = {
      docEntry: id,
      u_Status: EncashmentRequestStatus.Canceled,
    };

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedEncashmentRequests = this.encashmentRequestsStore
          .getValue()
          .map((encashmentRequest) => {
            if (encashmentRequest.id === id) {
              encashmentRequest.status = 'Canceled';
              encashmentRequest = { ...encashmentRequest };
            }
            return encashmentRequest;
          });
        this.encashmentRequestsStore.update(updatedEncashmentRequests);
      })
    );
  }

  getTypes(): Observable<EncashmentRequestType[]> {
    if (this.encashmentTypesStore.getValue().length == 0) {
      const url =
        this.url + `/GetEmployeeEncashTypes?EmployeeID=${this.user.id}`;
      this.http
        .get<EncashmentRequestType[]>(url, this.httpOptions)
        .subscribe((value) => {
          console.log(value);
          this.encashmentTypesStore.update(value);
        });
    }
    return this.encashmentTypesStore.observable$;
  }

  update(data: EncashmentRequestUpdate): Observable<any> {
    const url = this.url + '/UpdateEncashRequest';
    const body: EncashmentRequestUpdateApi =
      EncashmentRequestAdapter.updateToApi(data);

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedEncashmentRequests = this.encashmentRequestsStore
          .getValue()
          .map((encashmentRequest) => {
            if (encashmentRequest.id === data.id) {
              encashmentRequest = { ...encashmentRequest, ...data };
            }
            return encashmentRequest;
          });
        this.encashmentRequestsStore.update(updatedEncashmentRequests);
      })
    );
  }

  add(data: EncashmentRequestAdd): Observable<any> {
    const url = this.url + '/AddEncashRequest';
    const body: EncashmentRequestAddApi = EncashmentRequestAdapter.addToApi(
      data,
      this.user.id
    );

    return this.http.post<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        this.getAll().subscribe();
      })
    );
  }

  getEncashValue(
    encashCode: string,
    encashCount: string,
    date: string // yyyy-mm-dd
  ): Observable<EncashmentValue[]> {
    const url = `${this.url}/GetEmployeeEncashValue?EmployeeID=${this.user.id}&EncashDate=${date}&EncashCode=${encashCode}&EncashCount=${encashCount}`;
    return this.http.get<EncashmentValue[]>(url, this.httpOptions);
  }
}

class EncashmentRequestAdapter {
  static apiToModel(apiSchema: EncashmentRequestApi): EncashmentRequest {
    const obj: EncashmentRequest = {
      id: apiSchema.encashID,
      encashName: apiSchema.encashName,
      encashCode: apiSchema.encashCode,
      value: apiSchema.value,
      date: formatDateToISO(apiSchema.date),
      status: apiSchema.status,
      remarks: apiSchema.remarks,
      createDate: formatDateToISO(apiSchema.createDate),
      projectCode: apiSchema.projectCode,
      unitPrice: apiSchema.unitPrice,
      unitCount: apiSchema.unitCount,
      loanId: apiSchema.loanID,
      installmentCount: apiSchema.installmentCount,
    };
    return obj;
  }

  static addToApi(
    addSchema: EncashmentRequestAdd,
    employeeId: string
  ): EncashmentRequestAddApi {
    const obj: EncashmentRequestAddApi = {
      u_EmployeeID: employeeId,
      u_EncashType: addSchema.encashCode,
      u_Date: addSchema.date,
      u_UnitPrice: addSchema.unitPrice,
      u_UnitCount: addSchema.unitCount,
      u_ProjectCode: addSchema.projectCode,
      u_Remarks: addSchema.remarks,
      u_EncashValue: addSchema.value, //TODO
    };
    return obj;
  }

  static updateToApi(
    updateSchema: EncashmentRequestUpdate
  ): EncashmentRequestUpdateApi {
    const obj: EncashmentRequestUpdateApi = {
      docEntry: updateSchema.id,
      u_EncashType: updateSchema.encashCode,
      u_Date: updateSchema.date,
      u_UnitPrice: updateSchema.unitPrice,
      u_UnitCount: updateSchema.unitCount,
      u_ProjectCode: updateSchema.projectCode,
      u_Remarks: updateSchema.remarks,
      u_EncashValue: updateSchema.value, //todo
    };
    return obj;
  }
}
