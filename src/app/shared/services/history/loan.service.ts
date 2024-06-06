import { Injectable } from '@angular/core';
import { GenericHistoryService } from './generic-history.service';
import { LoanHistory, LoanHistoryApi } from '../../interfaces/history/loan';
import { Observable, map, tap } from 'rxjs';
import { User } from '../../interfaces/user';
import { SharedArrayStore } from '../../utils/shared-array-store';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { BaseService } from '../../base/base.service';
import { formatDateToISO } from '../../utils/data-formatter';
import { ItemStatusString } from '../../interfaces/generic-item';

@Injectable({
  providedIn: 'root',
})
export class LoanHistoryService
  extends BaseService
  implements GenericHistoryService<LoanHistory>
{
  private loanHistoryStore = new SharedArrayStore<LoanHistory>();
  private endpoint = '/Loans';
  private url = this.baseUrl + this.endpoint;

  get list$(): Observable<LoanHistory[]> {
    return this.loanHistoryStore.observable$;
  }

  get user(): User {
    return this.userService.getUser();
  }

  constructor(private http: HttpClient, private userService: LocalUserService) {
    super();
    this.loanHistoryStore.setDefaultSortByKeys([
      { key: 'id', ascending: false },
    ]);
  }
  getAll(): Observable<LoanHistory[]> {
    return this.http.get<LoanHistoryApi[]>(this.url, this.httpOptions).pipe(
      map((response) => response.map(LoanHistoryAdapter.apiToModel)),
      tap((loanHistory) => {
        this.loanHistoryStore.update(loanHistory);
      })
    );
  }
}

class LoanHistoryAdapter {
  static apiToModel(apiSchema: LoanHistoryApi): LoanHistory {
    const obj: LoanHistory = {
      id: apiSchema.loanID,
      dateSubmitted: formatDateToISO(apiSchema.dateSubmitted),
      employeeId: apiSchema.empID,
      employeeCode: apiSchema.empCode,
      fullName: apiSchema.fullName,
      fullNameF: apiSchema.fullNameF ?? '',
      loanCode: apiSchema.loanCode,
      loanName: apiSchema.loanName,
      totalAmount: parseFloat(apiSchema.totalAmount),
      installmentCount: parseInt(apiSchema.installmentCount),
      startDate: formatDateToISO(apiSchema.startDate),
      status: (apiSchema.status || 'Pending') as ItemStatusString,
    };
    return obj;
  }
}
