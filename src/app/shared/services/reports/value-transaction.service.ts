import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { Observable, tap } from 'rxjs';
import {
  ValueTransactionReport,
  ValueTransactionReportInput,
} from '../../interfaces/reports/value-transaction';
import { UserAlertService } from '../user-alert.service';
import { PdfWorkerService } from '../../workers/pdf-worker.service';
import { PdfVariableResolver } from '../../utils/pdf-utils/parser/pdf-variable-resolver';

@Injectable({
  providedIn: 'root',
})
export class ValueTransactionReportService extends BaseService {
  private url = this.baseUrl;

  constructor(
    private http: HttpClient,
    private pdfWorkerService: PdfWorkerService,
    private userAlertService: UserAlertService,
    private userService: LocalUserService
  ) {
    super();

    PdfVariableResolver.registerPipe('replaceEmpty', (value, args): string => {
      if (!value) return args.at(0) ?? '';
      if (typeof value === 'number') return value.toString();
      return value;
    });
  }

  get user() {
    return this.userService.getUser();
  }

  getReport(
    input: ValueTransactionReportInput,
    download: boolean = true
  ): Observable<ValueTransactionReport[]> {
    let { transactionType, fromDate, toDate } = input;
    fromDate = fromDate.replaceAll('-', '');
    toDate = toDate.replaceAll('-', '');
    const url =
      this.url +
      `/ValueTransactionReport?EmployeeID=${this.user.id}&UILang=???&TranType=${transactionType}&FromDate=${fromDate}&ToDate=${toDate}`;
    if (download) this.userAlertService.showLoading('Generating Report...');
    return this.http.get<ValueTransactionReport[]>(url, this.httpOptions).pipe(
      tap((data) => {
        if (download) {
          this.downloadPdf(input, data).then(() => {
            this.userAlertService.showSuccess('Report Generated Successfully.');
          });
        }
      })
    );
  }

  private async downloadPdf(
    input: ValueTransactionReportInput,
    data: ValueTransactionReport[]
  ) {
    let totalCredit = 0;
    let totalDebit = 0;

    const dataProcessed = data.map((value) => {
      value['debit'] = 0;
      value['credit'] = 0;
      if (value.tableName === '@NON_REP_DEDUCTIONS')
        value['credit'] = parseFloat(value.value);
      else if (value.tableName === '@NON_REP_ALLOWANCES')
        value['debit'] = parseFloat(value.value);
      else console.error(`Unknown value transaction table: ${value.tableName}`);

      totalCredit += value['credit'];
      totalDebit += value['debit'];

      return value;
    });
    const additionalVars = {
      totalCredit,
      totalDebit,
    };
    await this.pdfWorkerService.downloadFromFile(
      '/assets/report-json/value-transactions.pdf.json',
      dataProcessed,
      input,
      additionalVars
    );
  }
}
