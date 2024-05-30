import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  OvertimeRequestStatus,
  OvertimeRequest,
  OvertimeRequestType,
  OvertimeRequestUpdateSchema,
  OvertimeRequestAddSchema,
} from '../../interfaces/requests/overtime';
import { Observable, tap } from 'rxjs';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { GenericRequestService } from './generic-request.service';

type iOvertimeRequestService = GenericRequestService<
  OvertimeRequest,
  OvertimeRequestUpdateSchema,
  OvertimeRequestAddSchema,
  OvertimeRequestType
>;

@Injectable({
  providedIn: 'root',
})
export class OvertimeRequestService
  extends BaseService
  implements iOvertimeRequestService
{
  private overtimeRequestsStore = new SharedArrayStore<OvertimeRequest>();
  get list$(): Observable<OvertimeRequest[]> {
    return this.overtimeRequestsStore.observable$;
  }

  private overtimeTypesStore: SharedArrayStore<OvertimeRequestType> =
    new SharedArrayStore<OvertimeRequestType>();

  private endpoint = '/OvertimeRequest';
  private url = this.baseUrl + this.endpoint;

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();

    this.overtimeRequestsStore.setDefaultSortByKey('overtimeID', false);
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(): Observable<OvertimeRequest[]> {
    const url = `${this.url}/GetOverTime?EmployeeId=${this.user.id}`;
    return this.http
      .get<OvertimeRequest[]>(url, this.httpOptions)
      .pipe(
        tap((overtimeRequests) =>
          this.overtimeRequestsStore.update(overtimeRequests)
        )
      );
  }

  cancel(id: string): Observable<any> {
    const url = `${this.url}/UpdateOvertimeRequest`;
    const body = {
      docEntry: id,
      u_Status: OvertimeRequestStatus.Canceled.toString(),
    };

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedOvertimeRequests = this.overtimeRequestsStore
          .getValue()
          .map((overtimeRequest) => {
            if (overtimeRequest.overtimeID === id) {
              overtimeRequest.status = 'Canceled';
              overtimeRequest.statusTypeId = body.u_Status;
              overtimeRequest = { ...overtimeRequest };
            }
            return overtimeRequest;
          });
        this.overtimeRequestsStore.update(updatedOvertimeRequests);
      })
    );
  }

  getTypes(): Observable<OvertimeRequestType[]> {
    if (this.overtimeTypesStore.getValue().length == 0) {
      const url =
        this.url + `/GetEmployeeOvertimeType?EmployeeID=${this.user.id}`;
      this.http
        .get<OvertimeRequestType[]>(url, this.httpOptions)
        .subscribe((value) => {
          console.log(value);
          this.overtimeTypesStore.update(value);
        });
    }
    return this.overtimeTypesStore.observable$;
  }

  update(body: OvertimeRequestUpdateSchema): Observable<any> {
    const url = this.url + '/UpdateOvertimeRequest';

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedOvertimeRequests = this.overtimeRequestsStore
          .getValue()
          .map((overtimeRequest) => {
            if (overtimeRequest.overtimeID === body.docEntry) {
              // console.log('sync updated values');
              overtimeRequest.overtimeType =
                body.u_OvType ?? overtimeRequest.overtimeType;
              overtimeRequest.fromDate =
                body.u_FromDate ?? overtimeRequest.fromDate;
              overtimeRequest.toDate = body.u_ToDate ?? overtimeRequest.toDate;
              overtimeRequest.hour =
                parseInt(body.u_OvHour ?? '') || overtimeRequest.hour;
              overtimeRequest.minute =
                parseInt(body.u_OvMin ?? '') || overtimeRequest.minute;
              overtimeRequest.projectCode =
                body.u_ProjectCode ?? overtimeRequest.projectCode;
              overtimeRequest.remarks =
                body.u_Remarks ?? overtimeRequest.remarks;
              overtimeRequest = { ...overtimeRequest };
            }
            return overtimeRequest;
          });
        this.overtimeRequestsStore.update(updatedOvertimeRequests);
      })
    );
  }

  add(body: OvertimeRequestAddSchema): Observable<any> {
    const url = this.url + '/AddOvertimeRequest';

    if (!body.u_EmployeeID) body.u_EmployeeID = this.user.id;

    return this.http.post<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        this.getAll().subscribe();
      })
    );
  }
}
