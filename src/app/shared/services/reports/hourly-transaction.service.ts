import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { Observable, map, tap } from 'rxjs';
import {
  HourlyTransactionReport,
  HourlyTransactionReportApi,
  HourlyTransactionReportInput,
} from '../../interfaces/reports/hourly-transaction';
import { DatePipe } from '@angular/common';
import { formatDateToISO } from '../../utils/data-formatter';
import { UserAlertService } from '../user-alert.service';
import { PdfWorkerService } from '../../workers/pdf-worker.service';

@Injectable({
  providedIn: 'root',
})
export class HourlyTransactionReportService extends BaseService {
  private url = this.baseUrl;

  constructor(
    private http: HttpClient,
    private pdfWorkerService: PdfWorkerService,
    private userAlertService: UserAlertService,
    private userService: LocalUserService,
    private datePipe: DatePipe
  ) {
    super();
  }

  get user() {
    return this.userService.getUser();
  }

  getReport(
    input: HourlyTransactionReportInput,
    download: boolean = true
  ): Observable<HourlyTransactionReport[]> {
    let { transactionType, fromDate, toDate } = input;
    fromDate = fromDate.replaceAll('-', '');
    toDate = toDate.replaceAll('-', '');
    const url =
      this.url +
      `/HourlyTransactionReport?EmployeeID=${this.user.id}&UILang=???&TranType=${transactionType}&FromDate=${fromDate}&ToDate=${toDate}`;
    if (download) this.userAlertService.showLoading('Generating Report...');
    return this.http
      .get<HourlyTransactionReportApi[]>(url, this.httpOptions)
      .pipe(
        map((response) => response.map(HourlyTransactionAdapter.apiToModel)),
        tap((data) => {
          if (download) {
            this.downloadPdf(input, data).then(() => {
              this.userAlertService.showSuccess(
                'Report Downloaded Successfully.'
              );
            });
          }
        })
      );
  }

  private async downloadPdf(
    input: HourlyTransactionReportInput,
    data: HourlyTransactionReport[]
  ) {
    await this.pdfWorkerService.downloadFromFile(
      '/assets/report-json/hourly-transactions.pdf.json',
      data,
      input
    );
  }
}

class HourlyTransactionAdapter {
  static apiToModel(
    apiSchema: HourlyTransactionReportApi
  ): HourlyTransactionReport {
    const obj: HourlyTransactionReport = {
      employeeCode: apiSchema.empCode,
      fullName: apiSchema.fullName,
      transactionCode: apiSchema.tranCode,
      transactionName: apiSchema.tranName,
      fromDate: formatDateToISO(apiSchema.u_FromDate),
      toDate: formatDateToISO(apiSchema.u_ToDate),
      overtimeHours: parseFloat(apiSchema.overtimeHours),
      batchNumber: apiSchema.u_BatchNo ?? '-',
      numberOfHours: apiSchema.noOfHours ? parseFloat(apiSchema.noOfHours) : 0,
      remarks: apiSchema.u_Remarks ?? '-',
    };
    return obj;
  }
}
