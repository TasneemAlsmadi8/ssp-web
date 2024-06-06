import { Injectable } from '@angular/core';
import { GenericHistoryService } from './generic-history.service';
import { LeaveHistory, LeaveHistoryApi } from '../../interfaces/history/leave';
import { Observable, map, tap } from 'rxjs';
import { User } from '../../interfaces/user';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { BaseService } from '../../base/base.service';
import { formatDateToISO, formatTimeToHHmm } from '../../utils/data-formatter';
import { ItemStatusString } from '../../interfaces/generic-item';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  constructor() {}
}

@Injectable({
  providedIn: 'root',
})
export class LeaveHistoryService
  extends BaseService
  implements GenericHistoryService<LeaveHistory>
{
  private leaveHistoryStore = new SharedArrayStore<LeaveHistory>();
  private endpoint = '/Leave';
  private url = this.baseUrl + this.endpoint;

  get list$(): Observable<LeaveHistory[]> {
    return this.leaveHistoryStore.observable$;
  }

  get user(): User {
    return this.userService.getUser();
  }

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();
    this.leaveHistoryStore.setDefaultSortByKeys([
      { key: 'id', ascending: false },
    ]);
  }
  getAll(): Observable<LeaveHistory[]> {
    return this.http.get<LeaveHistoryApi[]>(this.url, this.httpOptions).pipe(
      map((response) => response.map(LeaveHistoryAdapter.apiToModel)),
      tap((leaveHistory) => {
        this.leaveHistoryStore.update(leaveHistory);
      })
    );
  }
}

class LeaveHistoryAdapter {
  static apiToModel(apiSchema: LeaveHistoryApi): LeaveHistory {
    const obj: LeaveHistory = {
      id: apiSchema.leaveID,
      leaveType: apiSchema.leaveType,
      leaveCode: apiSchema.leaveCode,
      fromDate: formatDateToISO(apiSchema.fromDate),
      toDate: formatDateToISO(apiSchema.toDate),
      fromTime: formatTimeToHHmm(apiSchema.fromTime ?? '0000'),
      toTime: formatTimeToHHmm(apiSchema.toTime ?? '0000'),
      status: (apiSchema.status || 'Pending') as ItemStatusString,
      remarks: apiSchema.remarks,
      dateSubmitted: formatDateToISO(apiSchema.dateSubmitted),
      employeeId: apiSchema.empID,
      employeeCode: apiSchema.empCode,
      fullName: apiSchema.fullName,
      fullNameF: apiSchema.fullName,
    };
    return obj;
  }
}
