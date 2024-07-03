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
import { PageOptions, PdfBuilder } from '../../utils/pdf-utils/pdf-builder';
import { Style } from '../../utils/pdf-utils/elements/element-styles';
import { DatePipe } from '@angular/common';
import { PdfJson } from '../../utils/pdf-utils/parser/element-json-types';
import { PdfParser } from '../../utils/pdf-utils/parser/pdf-parser';

@Injectable({
  providedIn: 'root',
})
export class LeaveBalanceReportService extends BaseService {
  private url = this.baseUrl;

  constructor(
    private http: HttpClient,
    private userService: LocalUserService,
    private datePipe: DatePipe
  ) {
    super();
  }

  get user() {
    return this.userService.getUser();
  }

  getReport(
    input: LeaveBalanceReportInput,
    download: boolean = true
  ): Observable<LeaveBalanceReport> {
    let { leaveCode, toDate } = input;
    toDate = toDate.replaceAll('-', '');
    const url =
      this.url +
      `/LeaveBalanceReport?EmployeeID=${this.user.id}&LeaveType=${leaveCode}&ToDate=${toDate}&UILang=???`;
    return this.http.get<LeaveBalanceReportApi[]>(url, this.httpOptions).pipe(
      map((response) => LeaveBalanceAdapter.apiToModel(response[0])),
      tap((data) => {
        if (download) this.downloadPdf(input, data);
      })
    );
  }

  private async downloadPdf(
    input: LeaveBalanceReportInput,
    data: LeaveBalanceReport
  ) {
    const tableObj = {
      'S.N.': 1,
      'Employee Code': data.employeeCode,
      'Employee Name': data.fullName,
      'Leave Type': data.leaveName,
      Entitlement: data.entitlement,
      'Opening Balance': data.openingBalance,
      'Earned Leaves': data.earnedLeaves,
      'Taken Leaves': data.takenLeaves,
      'Encashed Leaves': data.encashedDays,
      'Leave Balance': data.leaveBalance,
      'Vacation Value': data.paidVacationValue,
    };
    const leaveBalanceReportJson: PdfJson = {
      fileName: 'Leave Balance Report.pdf',
      pageOptions: {
        marginTop: 90,
        marginBottom: 50,
        marginLeft: 20,
        marginRight: 20,
      },
      template: {
        pageMargins: {
          marginTop: 70,
        },
        variables: {
          title: 'Leave Balance Report',
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
      elements: [
        {
          type: 'paragraph',
          text: `To Date:  ${this.formatDateToDisplay(new Date(input.toDate))}`,
          styles: {
            'font-size': 12,
            'font-weight': 'bold',
            'margin-bottom': 5,
            padding: 10,
            'border-bottom': 2,
          },
        },
        {
          type: 'object-table',
          data: [tableObj],
          rowHeaders: true,
          cellStyles: {
            'align-content-horizontally': 'center',
            font: 'Noto Sans',
            'font-size': 8,
            'background-color': '#dddddd',
            // 'font-weight': 'bold',
            border: 0,
          },
          headerStyles: {
            'align-content-horizontally': 'center',
            'font-size': 8,
            'background-color': '#ffffff',
            'font-weight': 'bold',
            border: 0,
          },
          tableStyles: {},
        },
      ],
    };

    const parser = new PdfParser();
    const pdfBuilder = parser.parse(leaveBalanceReportJson);

    // pdfBuilder.elements[1].children.forEach(
    //   (child) => (child.showBoxes = true)
    // );
    pdfBuilder.download();
  }

  private formatDateToDisplay(date: Date): string {
    const result = this.datePipe.transform(date, 'dd/MM/yyyy');
    if (!result) throw new Error('Invalid Date');

    return result;
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

function camelCaseToSentence(camelCaseStr: string): string {
  // Replace camel case parts with space and the same letter in uppercase
  const sentence = camelCaseStr
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before uppercase letters
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2'); // Handle consecutive uppercase letters

  // Capitalize the first letter of the sentence
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
function convertObjectKeysToSentences(
  obj: Record<string, any>
): Record<string, any> {
  const newObj: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = camelCaseToSentence(key);
      newObj[newKey] = obj[key];
    }
  }

  return newObj;
}
