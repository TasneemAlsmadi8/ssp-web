import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { Observable, map, tap } from 'rxjs';
import {
  LoanBalanceReport,
  LoanBalanceReportApi,
} from '../../interfaces/reports/loan-balance';
import { PdfWorkerService } from '../../workers/pdf-worker.service';
import { formatDateToISO } from '../../utils/data-formatter';

@Injectable({
  providedIn: 'root',
})
export class LoanBalanceReportService extends BaseService {
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

  getReport(download: boolean = true): Observable<LoanBalanceReport[]> {
    const url =
      this.url + `/LoanBalanceReport?EmployeeID=${this.user.id}&UILang=???`;
    return this.http.get<LoanBalanceReportApi[]>(url, this.httpOptions).pipe(
      map((response) => response.map(LoanBalanceAdapter.apiToModel)),
      tap((data) => {
        if (download) this.downloadPdf(data);
      })
    );
  }

  private async downloadPdf(data: LoanBalanceReport[]) {
    await this.pdfWorkerService.downloadFromFile(
      '/assets/report-json/loan-balance.pdf.json',
      data
    );
  }
}

class LoanBalanceAdapter {
  static apiToModel(apiSchema: LoanBalanceReportApi): LoanBalanceReport {
    const obj: LoanBalanceReport = {
      employeeId: apiSchema.empID,
      employeeCode: apiSchema.u_EmpCode,
      transactionDate: formatDateToISO(apiSchema.u_TransactionDate),
      transactionValue: parseFloat(apiSchema.u_TransactionValue),
      remarks: apiSchema.u_Remarks ?? '-',
      paidTran: apiSchema.u_PaidTran,
      loanAmount: parseFloat(apiSchema.u_LoanAmount),
      startDate: formatDateToISO(apiSchema.u_StartDate),
      settlementCount: parseInt(apiSchema.u_SettlementCount),
      loanBalance: parseFloat(apiSchema.u_LoanBalance),
      multiTranID: apiSchema.u_MultiTranID,
      name: apiSchema.name ?? '-',
      loanName: apiSchema.loanName,
      loanRemarks: apiSchema.loan_Remarks ?? '-',
      batchNumber: apiSchema.u_BatchNo ?? '-',
      locked: apiSchema.u_Locked,
      fullName: apiSchema.u_FullName,
      fullNameF: apiSchema.u_FullNameF,
      docEntry: apiSchema.docEntry,
    };
    return obj;
  }
}
