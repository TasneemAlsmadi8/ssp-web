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
import { Style } from '../../utils/pdf-utils/abstract-element';
import { DatePipe } from '@angular/common';

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

  private downloadPdf(
    input: LeaveBalanceReportInput,
    data: LeaveBalanceReport
  ) {
    const templatePage: Partial<PageOptions> = {
      // height: 0,
      // width: 0,
      marginTop: 70,
      marginBottom: 50,
      marginLeft: 20,
      marginRight: 20,
    };
    const builder = new PdfBuilder('Leave Balance Report.pdf', templatePage);

    const headerContainer = builder.createHorizontalContainer({
      styles: {},
    });
    // headerContainer.showBoxes = true;

    const title = builder.createParagraph('Leave Balance Report', {
      styles: {
        // 'border-bottom': 1,
        // 'margin-bottom': 15,
        'margin-left': 30,
        'font-size': 14,
        'font-weight': 'bold',
        'align-content-horizontally': 'center',
        'align-content-vertically': 'center',
      },
      standalone: true,
    });
    headerContainer.addElement(title, {
      maxWidth: { percent: 100, pixels: -50 },
    });
    // title.showBoxes = true;

    const headerSide = builder.createVerticalContainer({ standalone: true });
    headerContainer.addElement(headerSide, { maxWidth: { pixels: 50 } });
    // headerSide.showBoxes = true;

    const pageNum = builder.createParagraph('Page 1 of 1', {
      styles: {
        'margin-bottom': 3,
        'font-size': 8,
        'align-content-horizontally': 'end',
        // 'align-content-vertically': 'center',
      },
      standalone: true,
    });
    headerSide.addElement(pageNum);

    const todayParagraph = builder.createParagraph(
      this.formatDateToDisplay(new Date()),
      {
        styles: {
          'font-size': 8,
          'align-content-horizontally': 'end',
          // 'align-content-vertically': 'center',
        },
        standalone: true,
      }
    );
    headerSide.addElement(todayParagraph);

    builder.createParagraph(
      `To Date:  ${this.formatDateToDisplay(new Date(input.toDate))}`,
      {
        styles: {
          'font-size': 12,
          'font-weight': 'bold',
          'margin-bottom': 5,
          padding: 10,
          'border-bottom': 2,
        },
      }
    );

    const cellStyles: Style = {
      // 'align-content-vertically': 'center',
      'align-content-horizontally': 'center',
      'font-size': 8,
      'background-color': '#dddddd',
      border: 0,
    };

    const displayData = {
      'S.N.': 1,
      'Employee Code': data.employeeCode,
      'Employee Name': data.fullName,
      'Leave Type': data.leaveCode,
      Entitlement: data.entitlement,
      'Opening Balance': data.openingBalance,
      'Earned Leaves': data.earnedLeaves,
      'Taken Leaves': data.takenLeaves,
      'Encashed Leaves': data.encashedDays,
      'Leave Balance': data.leaveBalance,
      'Vacation Value': data.paidVacationValue,
    };
    const table = builder.createTableFromObject(displayData, {
      cellStyles,
      headerStyles: {
        ...cellStyles,
        'background-color': '#ffffff',
        'font-weight': 'bold',
      },
      rowHeaders: true,
    });
    // table.rows[0].cells.forEach((cell) => (cell.showBoxes = true));
    // console.log(table.rows[0].cells[4]);

    builder.download();
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
