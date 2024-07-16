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
import { PdfJson } from '../../utils/pdf-utils/parser/element-json-types';
import {
  formatDateToDisplay,
} from '../../utils/data-formatter';
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
    const tableData = data.map((row) => {
      return {
        'Employee Code': row.employeeCode,
        'Employee Name': row.fullName,
        'Tran Code': row.transactionCode,
        Transaction: row.transactionName,
        'From Date': row.fromDate,
        'To Date': row.toDate,
        'No of Hours': row.numberOfHours,
        'O.T. Hours': row.overtimeHours,
        'Salary Batch No.': row.batchNumber,
        Remarks: row.remarks,
      };
    });
    const hourlyTransactionReportJson: PdfJson = {
      name: 'Hourly Transactions Report.pdf',
      pageOptions: {
        marginTop: 110,
        marginBottom: 50,
        marginLeft: 20,
        marginRight: 20,
        landscape: true,
      },
      variables: {
        title: 'Hourly Transactions Report',
      },
      template: {
        pageOptions: {
          marginTop: 70,
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
          type: 'auto-table',
          schema: {
            'Employee Code': 'employeeCode',
            'Employee Name': 'fullName',
            'Tran Code': 'transactionCode',
            Transaction: 'transactionName',
            'From Date': 'fromDate',
            'To Date': 'toDate',
            'No of Hours': 'numberOfHours',
            'O.T. Hours': 'overtimeHours',
            'Salary Batch No.': 'batchNumber',
            Remarks: 'remarks',
          },
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

    await this.pdfWorkerService.download(
      hourlyTransactionReportJson,
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
      fromDate: formatDateToDisplay(apiSchema.u_FromDate),
      toDate: formatDateToDisplay(apiSchema.u_ToDate),
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
