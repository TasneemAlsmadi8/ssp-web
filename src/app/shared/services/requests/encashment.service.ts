import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  EncashmentRequestStatus,
  EncashmentRequest,
  EncashmentRequestType,
  EncashmentRequestUpdateSchema,
  EncashmentRequestAddSchema,
  EncashmentValue,
} from '../../interfaces/requests/encashment';
import { Observable, tap } from 'rxjs';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { GenericRequestService } from './generic-request.service';
import { formatDateToDisplay } from '../../utils/data-formatter';

type iEncashmentRequestService = GenericRequestService<
  EncashmentRequest,
  EncashmentRequestUpdateSchema,
  EncashmentRequestAddSchema,
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

    this.encashmentRequestsStore.setDefaultSortByKey('encashID', false);
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(): Observable<EncashmentRequest[]> {
    const url = `${this.url}/GetEncash?EmployeeId=${this.user.id}`;
    return this.http
      .get<EncashmentRequest[]>(url, this.httpOptions)
      .pipe(
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
      u_Status: EncashmentRequestStatus.Canceled.toString(),
    };

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedEncashmentRequests = this.encashmentRequestsStore
          .getValue()
          .map((encashmentRequest) => {
            if (encashmentRequest.encashID === id) {
              encashmentRequest.status = 'Canceled';
              encashmentRequest.u_Status = body.u_Status;
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

  update(body: EncashmentRequestUpdateSchema): Observable<any> {
    const url = this.url + '/UpdateEncashRequest';

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedEncashmentRequests = this.encashmentRequestsStore
          .getValue()
          .map((encashmentRequest) => {
            if (encashmentRequest.encashID === body.docEntry) {
              console.log('sync updated values');
              encashmentRequest.encashCode =
                body.u_EncashType ?? encashmentRequest.encashCode;
              encashmentRequest.date = body.u_Date ?? encashmentRequest.date;
              encashmentRequest.unitPrice =
                body.u_UnitPrice ?? encashmentRequest.unitPrice;
              encashmentRequest.unitCount =
                body.u_UnitCount ?? encashmentRequest.unitCount;
              encashmentRequest.projectCode =
                body.u_ProjectCode ?? encashmentRequest.projectCode;
              encashmentRequest.remarks =
                body.u_Remarks ?? encashmentRequest.remarks;
              encashmentRequest = { ...encashmentRequest };
            }
            return encashmentRequest;
          });
        this.encashmentRequestsStore.update(updatedEncashmentRequests);
      })
    );
  }

  add(body: EncashmentRequestAddSchema): Observable<any> {
    const url = this.url + '/AddEncashRequest';

    if (!body.u_EmployeeID) body.u_EmployeeID = this.user.id;

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
