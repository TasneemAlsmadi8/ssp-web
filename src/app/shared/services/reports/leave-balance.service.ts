import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { Observable, map, tap } from 'rxjs';
import {
  LeaveBalanceReport,
  LeaveBalanceReportApi,
  LeaveBalanceReportInput,
} from '../../interfaces/reports/leave-balance';
import { DatePipe } from '@angular/common';
import { PdfWorkerService } from '../../workers/pdf-worker.service';

@Injectable({
  providedIn: 'root',
})
export class LeaveBalanceReportService extends BaseService {
  private url = this.baseUrl;

  constructor(
    private http: HttpClient,
    private pdfWorkerService: PdfWorkerService,
    private userService: LocalUserService
  ) {
    super();
  }

  get user() {
    return this.userService.getUser();
  }

  getReport(
    input: LeaveBalanceReportInput,
    download: boolean = true
  ): Observable<LeaveBalanceReport[]> {
    let { leaveCode, toDate } = input;
    toDate = toDate.replaceAll('-', '');
    const url =
      this.url +
      `/LeaveBalanceReport?EmployeeID=${this.user.id}&LeaveType=${leaveCode}&ToDate=${toDate}&UILang=???`;
    return this.http.get<LeaveBalanceReportApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(LeaveBalanceAdapter.apiToModel)),
      tap((data) => {
        if (download) this.downloadPdf(input, data);
      })
    );
  }

  private async downloadPdf(
    input: LeaveBalanceReportInput,
    data: LeaveBalanceReport[]
  ) {
    await this.pdfWorkerService.downloadFromFile(
      '/assets/report-json/leave-balance.pdf.json',
      data,
      input
    );
  }
}

class LeaveBalanceAdapter {
  static apiToModel(apiSchema: LeaveBalanceReportApi): LeaveBalanceReport {
    const obj: LeaveBalanceReport = {
      employeeId: apiSchema.empID,
      employeeCode: apiSchema.employeeCode,
      fullName: apiSchema.fullName,
      currentSalary: parseFloat(apiSchema.currentSalary),
      entitlement: parseFloat(apiSchema.entitlement),
      openingBalance: parseFloat(apiSchema.openingBalance),
      earnedLeaves: parseFloat(apiSchema.earnedLeaves),
      overtimeLeaves: parseFloat(apiSchema.overtimeLeaves),
      takenLeaves: parseFloat(apiSchema.takenLeaves),
      encashedDays: parseFloat(apiSchema.encashedDays),
      deductionFromLeaveBalance: parseFloat(
        apiSchema.deductionFromLeaveBalance
      ),
      opEncashments: parseFloat(apiSchema.opEncashments),
      leaveBalance: parseFloat(apiSchema.leaveBalance),
      leaveName: apiSchema.leaveName,
      monthDays: parseFloat(apiSchema.u_MonthDays),
      monthDaysCalendar: apiSchema.u_MonthDaysCalendar,
      paidOnEOS: apiSchema.u_PaidOnEOS,
      dept: apiSchema.dept,
      position: apiSchema.position,
      branch: apiSchema.branch,
      leaveCode: apiSchema.leaveCode,
      basicSalary: parseFloat(apiSchema.basicSalary),
      paidVacationValue: parseFloat(apiSchema.paidVacationValue),
    };
    return obj;
  }
}
