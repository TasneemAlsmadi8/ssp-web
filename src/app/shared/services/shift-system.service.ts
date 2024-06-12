import { Injectable } from '@angular/core';
import { BaseService } from './../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from './local-user.service';
import { Observable, map, tap } from 'rxjs';
import { SharedArrayStore } from './../utils/shared-array-store';
import { formatDateToISO } from '../utils/data-formatter';
import { EmployeeShift, EmployeeShiftApi } from '../interfaces/shift-system';

@Injectable({
  providedIn: 'root',
})
export class ShiftSystemService extends BaseService {
  private shiftsStore = new SharedArrayStore<EmployeeShift>();
  get list$(): Observable<EmployeeShift[]> {
    return this.shiftsStore.observable$;
  }

  private endpoint = '/Shifts';
  private url = this.baseUrl + this.endpoint;

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();

    this.shiftsStore.setDefaultSortByKeys([{ key: 'date', ascending: true }]);
  }

  get user() {
    return this.userService.getUser();
  }

  getAll(date: Date = new Date()): Observable<EmployeeShift[]> {
    return this.getShiftsById(this.user.id, date).pipe(
      tap((shifts) => {
        this.shiftsStore.add(shifts, (a, b) => a.id === b.id);
        // console.log(this.shiftsStore.length);
      })
    );
  }

  getShiftsById(id: string, date: Date): Observable<EmployeeShift[]> {
    const url = `${this.url}/getShiftDataByEmpId?Month=${
      date.getMonth() + 1
    }&Year=${date.getFullYear()}&EmpId=${id}`;
    return this.http
      .get<EmployeeShiftApi[]>(url, this.httpOptions)
      .pipe(map((response) => response.map(ShiftSystemAdapter.apiToModel)));
  }

  // delete(id: string): Observable<any> {
  //   const url = `${this.url}/UpdateEmployeeShift`;
  //   const body = {
  //     docEntry: id,
  //     u_Status: ItemStatus.Canceled,
  //   };

  //   return this.http.patch<any>(url, body, this.httpOptions).pipe(
  //     tap(() => {
  //       const updatedEmployeeShifts = this.shiftsStore
  //         .getValue()
  //         .map((shift) => {
  //           if (shift.id === id) {
  //             shift.status = 'Canceled';
  //             // shift.statusTypeId = body.u_Status;
  //             // shift.u_Status = body.u_Status;
  //             shift = { ...shift };
  //           }
  //           return shift;
  //         });
  //       this.shiftsStore.update(updatedEmployeeShifts);
  //     })
  //   );
  // }

  // add(data: EmployeeShiftAdd): Observable<any> {
  //   const url = this.url + '/AddLeave';

  //   const body: EmployeeShiftAddApi = ShiftSystemAdapter.addToApi(
  //     data,
  //     this.user.id
  //   );

  //   return this.http.post<any>(url, body, this.httpOptions).pipe(
  //     tap(() => {
  //       this.getAll().subscribe();
  //     })
  //   );
  // }
}

class ShiftSystemAdapter {
  static apiToModel(apiSchema: EmployeeShiftApi): EmployeeShift {
    const obj: EmployeeShift = {
      id: apiSchema.docEntry + '-' + apiSchema.lineId,
      employeeId: apiSchema.u_EmpID,
      employeeCode: apiSchema.u_EmpCode,
      employeeName: apiSchema.u_EmpName,
      date: formatDateToISO(apiSchema.u_Date),
      shiftType: apiSchema.u_Shift,
    };
    return obj;
  }

  // static addToApi(
  //   addSchema: EmployeeShiftAdd,
  //   employeeId: string
  // ): EmployeeShiftAddApi {
  //   const obj: EmployeeShiftAddApi = {
  //     u_EmployeeID: employeeId,
  //     u_LeaveType: addSchema.leaveCode,
  //     u_FromDate: addSchema.fromDate,
  //     u_ToDate: addSchema.toDate,
  //     u_FromTime: addSchema.fromTime,
  //     u_ToTime: addSchema.toTime,
  //     u_Remarks: addSchema.remarks,
  //   };
  //   return obj;
  // }

  // static updateToApi(
  //   updateSchema: EmployeeShiftUpdate
  // ): EmployeeShiftUpdateApi {
  //   const obj: EmployeeShiftUpdateApi = {
  //     docEntry: updateSchema.id,
  //     u_LeaveType: updateSchema.leaveCode,
  //     u_FromDate: updateSchema.fromDate,
  //     u_ToDate: updateSchema.toDate,
  //     u_FromTime: updateSchema.fromTime,
  //     u_ToTime: updateSchema.toTime,
  //     u_Remarks: updateSchema.remarks,
  //     u_Status: ItemStatus.Pending,
  //   };
  //   return obj;
  // }
}
