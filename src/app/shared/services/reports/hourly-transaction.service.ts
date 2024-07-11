import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { Observable, catchError, map, of, tap } from 'rxjs';
import {
  HourlyTransactionReport,
  HourlyTransactionReportApi,
  HourlyTransactionReportInput,
} from '../../interfaces/reports/hourly-transaction';
import { DatePipe } from '@angular/common';
import { PdfJson } from '../../utils/pdf-utils/parser/element-json-types';
import { formatDateToISO } from '../../utils/data-formatter';
import { UserAlertService } from '../user-alert.service';
import { PdfWorkerService } from '../pdf-worker.service';

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
    const tableData = data.map((row) => {
      return {
        'Employee Code': row.employeeCode,
        'Employee Name': row.fullName,
        'Tran Code': row.transactionCode,
        Transaction: row.transactionName,
        'From Date': this.formatDateToDisplay(row.fromDate),
        'To Date': this.formatDateToDisplay(row.toDate),
        'No of Hours': row.numberOfHours,
        'O.T. Hours': row.overtimeHours,
        'Salary Batch No.': row.batchNumber,
        Remarks: row.remarks,
      };
    });
    const hourlyTransactionReportJson: PdfJson = {
      fileName: 'Hourly Transactions Report.pdf',
      pageOptions: {
        marginTop: 110,
        marginBottom: 50,
        marginLeft: 20,
        marginRight: 20,
        landscape: true,
      },
      template: {
        pageMargins: {
          marginTop: 70,
        },
        variables: {
          title: 'Hourly Transactions Report',
          date: this.formatDateToDisplay(new Date()),
        },
        elements: [
          {
            type: 'horizontal-container',
            elements: [
              {
                type: 'p',
                text: '${title}',
                styles: {
                  'margin-left': 30,
                  'font-size': 14,
                  'font-weight': 'bold',
                  'align-content-horizontally': 'center',
                  'align-content-vertically': 'center',
                },
              },
              {
                type: 'vertical-container',
                elements: [
                  {
                    type: 'paragraph',
                    text: 'Page ${pageNumber} of ${totalPages}',
                    styles: {
                      'margin-bottom': 3,
                      'font-size': 8,
                      'align-content-horizontally': 'end',
                    },
                  },
                  {
                    type: 'paragraph',
                    text: '${date}',
                    styles: {
                      'font-size': 8,
                      'align-content-horizontally': 'end',
                    },
                  },
                ],
              },
            ],
            widths: ['100%-50', '50'],
          },
        ],
      },
      styles: {
        'font-size': 8,
      },
      elements: [
        {
          type: 'object-table',
          data: tableData,
          rowHeaders: true,
          cellStyles: {
            'align-content-horizontally': 'center',
            font: 'Noto Sans',
            border: 0,
            'padding-top': 2,
            'padding-bottom': 2,
          },
          headerStyles: {
            'font-weight': 'bold',
            'border-top': 1,
            'border-bottom': 1,
          },
          rowStyles: {
            even: {
              'background-color': '#eeeeee',
            },
          },
        },
      ],
    };

    await this.pdfWorkerService.download(hourlyTransactionReportJson);
  }

  private formatDateToDisplay(date: Date | string): string {
    if (typeof date === 'string') date = new Date(date);
    const result = this.datePipe.transform(date, 'dd/MM/yyyy');
    if (!result) throw new Error('Invalid Date');

    return result;
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
      batchNumber: apiSchema.u_BatchNo,
      numberOfHours: apiSchema.noOfHours
        ? parseFloat(apiSchema.noOfHours)
        : undefined,
      remarks: apiSchema.u_Remarks ?? undefined,
    };
    return obj;
  }
}
