import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
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
import { formatDateToISO } from '../../utils/data-formatter';
import { ItemStatus, ItemStatusString } from '../../interfaces/generic-item';

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
    const request = this.encashmentRequestsStore.find((v) => v.id === id);
    const body: EncashmentRequestUpdateApi = {
      docEntry: id,
      u_EmployeeID: this.user.id,
      u_Status: ItemStatus.Canceled,
      u_Date: request?.date.replaceAll('-', ''),
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
      this.getTypesByEmployeeId(this.user.id).subscribe((value) => {
        value.unshift({ code: '', name: '-select-' });
        this.encashmentTypesStore.update(value);
      });
    }
    return this.encashmentTypesStore.observable$;
  }

  getTypesByEmployeeId(id: string): Observable<EncashmentRequestType[]> {
    const url = this.url + `/GetEmployeeEncashTypes?EmployeeID=${id}`;
    return this.http.get<EncashmentRequestType[]>(url, this.httpOptions);
  }

  update(data: EncashmentRequestUpdate, employeeId?: string): Observable<any> {
    if (!employeeId) employeeId = this.user.id;
    const url = this.url + '/UpdateEncashRequest';
    const body: EncashmentRequestUpdateApi =
      EncashmentRequestAdapter.updateToApi(data, employeeId);

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedEncashmentRequests = this.encashmentRequestsStore
          .getValue()
          .map((encashmentRequest) => {
            if (encashmentRequest.id === data.id) {
              encashmentRequest = {
                ...encashmentRequest,
                ...data,
                status: 'Pending',
              };
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
    return this.getEncashValueByEmployeeId(
      this.user.id,
      encashCode,
      encashCount,
      date
    );
  }
  getEncashValueByEmployeeId(
    id: string,
    encashCode: string,
    encashCount: string,
    date: string // yyyy-mm-dd
  ): Observable<EncashmentValue[]> {
    const url = `${this.url}/GetEmployeeEncashValue?EmployeeID=${id}&EncashDate=${date}&EncashCode=${encashCode}&EncashCount=${encashCount}`;
    return this.http.get<EncashmentValue[]>(url, this.httpOptions);
  }
}

class EncashmentRequestAdapter {
  static apiToModel(apiSchema: EncashmentRequestApi): EncashmentRequest {
    const obj: EncashmentRequest = {
      id: apiSchema.encashID,
      encashName: apiSchema.encashName,
      encashCode: apiSchema.encashCode,
      value: parseFloat(apiSchema.value),
      date: formatDateToISO(apiSchema.date),
      status: apiSchema.status as ItemStatusString,
      remarks: apiSchema.remarks,
      createDate: formatDateToISO(apiSchema.createDate),
      projectCode: apiSchema.projectCode,
      unitPrice: parseFloat(apiSchema.unitPrice),
      unitCount: parseFloat(apiSchema.unitCount),
      loanId: apiSchema.loanID,
      original: apiSchema,
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
      u_Date: addSchema.date.replaceAll('-', ''),
      u_UnitCount: addSchema.unitCount.toString(),
      u_ProjectCode: addSchema.projectCode,
      u_Remarks: addSchema.remarks,
      u_EncashValue: addSchema.value?.toString(), //TODO
    };
    return obj;
  }

  static updateToApi(
    updateSchema: EncashmentRequestUpdate,
    employeeId: string
  ): EncashmentRequestUpdateApi {
    const obj: EncashmentRequestUpdateApi = {
      docEntry: updateSchema.id,
      u_EmployeeID: employeeId,
      u_EncashType: updateSchema.encashCode,
      u_Date: updateSchema.date?.replaceAll('-', ''),
      u_UnitPrice: updateSchema.unitPrice?.toString(),
      u_UnitCount: updateSchema.unitCount?.toString(),
      u_ProjectCode: updateSchema.projectCode,
      u_Remarks: updateSchema.remarks,
      u_EncashValue: updateSchema.value?.toString(), //todo
      // u_Status: ItemStatus.Pending, //TODO: ask about patch api
    };
    return obj;
  }
}
