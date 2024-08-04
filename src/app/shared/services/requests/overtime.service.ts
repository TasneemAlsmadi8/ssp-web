import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import {
  OvertimeRequest,
  OvertimeRequestType,
  OvertimeRequestUpdate,
  OvertimeRequestAdd,
  OvertimeRequestUpdateApi,
  OvertimeRequestAddApi,
  OvertimeRequestApi,
} from '../../interfaces/requests/overtime';
import { Observable, map, tap } from 'rxjs';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { GenericRequestService } from './generic-request.service';
import { formatDateToISO } from '../../utils/data-formatter';
import { ProjectsService } from '../projects.service';
import { ItemStatus, ItemStatusString } from '../../interfaces/generic-item';

type iOvertimeRequestService = GenericRequestService<
  OvertimeRequest,
  OvertimeRequestUpdate,
  OvertimeRequestAdd,
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

  constructor(
    private http: HttpClient,
    private userService: LocalUserService,
    private projectService: ProjectsService
  ) {
    super();

    this.overtimeRequestsStore.setDefaultSortByKey('id', false);
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(): Observable<OvertimeRequest[]> {
    const url = `${this.url}/GetOverTime?EmployeeId=${this.user.id}`;
    return this.http.get<OvertimeRequestApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(OvertimeRequestAdapter.apiToModel)),
      tap((overtimeRequests) =>
        this.overtimeRequestsStore.update(overtimeRequests)
      )
    );
  }

  cancel(id: string): Observable<any> {
    const url = `${this.url}/UpdateOvertimeRequest`;
    const body = {
      docEntry: id,
      u_Status: ItemStatus.Canceled,
    };

    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedOvertimeRequests = this.overtimeRequestsStore
          .getValue()
          .map((overtimeRequest) => {
            if (overtimeRequest.id === id) {
              overtimeRequest.status = 'Canceled';
              // overtimeRequest.statusTypeId = body.u_Status;
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
      this.getTypesByEmployeeId(this.user.id).subscribe((value) => {
        this.overtimeTypesStore.update(value);
      });
    }
    return this.overtimeTypesStore.observable$;
  }

  getTypesByEmployeeId(id: string): Observable<OvertimeRequestType[]> {
    const url = this.url + `/GetEmployeeOvertimeType?EmployeeID=${id}`;
    return this.http.get<OvertimeRequestType[]>(url, this.httpOptions);
  }

  update(data: OvertimeRequestUpdate): Observable<any> {
    const url = this.url + '/UpdateOvertimeRequest';

    const body: OvertimeRequestUpdateApi =
      OvertimeRequestAdapter.updateToApi(data);
    return this.http.patch<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        const updatedOvertimeRequests = this.overtimeRequestsStore
          .getValue()
          .map((overtimeRequest) => {
            if (overtimeRequest.id === data.id) {
              // console.log('sync updated values');
              let projectName: string;
              if (data.projectCode) {
                projectName = this.projectService.getProjectName(
                  data.projectCode
                );
              } else {
                projectName = overtimeRequest.projectName;
              }
              overtimeRequest = {
                ...overtimeRequest,
                ...data,
                projectName,
                status: 'Pending',
              };
            }
            return overtimeRequest;
          });
        this.overtimeRequestsStore.update(updatedOvertimeRequests);
      })
    );
  }

  add(data: OvertimeRequestAdd): Observable<any> {
    const url = this.url + '/AddOvertimeRequest';

    const body: OvertimeRequestAddApi = OvertimeRequestAdapter.addToApi(
      data,
      this.user.id
    );
    return this.http.post<any>(url, body, this.httpOptions).pipe(
      tap(() => {
        this.getAll().subscribe();
      })
    );
  }
}

class OvertimeRequestAdapter {
  static apiToModel(apiSchema: OvertimeRequestApi): OvertimeRequest {
    const obj: OvertimeRequest = {
      id: apiSchema.overtimeID,
      overtimeType: apiSchema.overtimeType,
      overtimeCode: apiSchema.overtimeCode,
      date: formatDateToISO(apiSchema.fromDate),
      status: apiSchema.status as ItemStatusString,
      overtimeHours: parseFloat(apiSchema.ovHours),
      hour: apiSchema.hour,
      minute: apiSchema.minute,
      remarks: apiSchema.remarks,
      projectCode: apiSchema.projectCode,
      projectName: apiSchema.projectName,
    };
    return obj;
  }

  static addToApi(
    addSchema: OvertimeRequestAdd,
    employeeId: string
  ): OvertimeRequestAddApi {
    const obj: OvertimeRequestAddApi = {
      u_EmployeeID: employeeId,
      u_OvType: addSchema.overtimeCode,
      u_FromDate: addSchema.fromDate.replaceAll('-', ''),
      u_ToDate: addSchema.toDate.replaceAll('-', ''),
      u_OvHour: addSchema.hour.toString(),
      u_OvMin: addSchema.minute.toString(),
      u_ProjectCode: addSchema.projectCode,
      u_Remarks: addSchema.remarks,
    };
    return obj;
  }

  static updateToApi(
    updateSchema: OvertimeRequestUpdate
  ): OvertimeRequestUpdateApi {
    const obj: OvertimeRequestUpdateApi = {
      docEntry: updateSchema.id,
      u_OvType: updateSchema.overtimeCode,
      u_FromDate: updateSchema.fromDate?.replaceAll('-', ''),
      u_ToDate: updateSchema.toDate?.replaceAll('-', ''),
      u_OvHour: updateSchema.hour?.toString(),
      u_OvMin: updateSchema.minute?.toString(),
      u_ProjectCode: updateSchema.projectCode,
      u_Remarks: updateSchema.remarks,
      u_Status: ItemStatus.Pending,
    };
    return obj;
  }
}
