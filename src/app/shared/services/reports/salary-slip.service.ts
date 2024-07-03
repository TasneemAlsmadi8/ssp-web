import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { Observable, map, tap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PdfJson } from '../../utils/pdf-utils/parser/element-json-types';
import { PdfParser } from '../../utils/pdf-utils/parser/pdf-parser';
import {
  SalarySlipReport,
  SalarySlipReportApi,
  SalarySlipReportInput,
} from '../../interfaces/reports/salary-slip';
import { formatDateToISO, formatFloat } from '../../utils/data-formatter';
import { endOfMonth, format, startOfMonth } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class SalarySlipReportService extends BaseService {
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
    input: SalarySlipReportInput,
    download: boolean = true
  ): Observable<SalarySlipReport> {
    let { month, year } = input;
    const url =
      this.url +
      `/SalaryReport/GetSalarySlipReport?EmployeeID=${this.user.id}&Month=${month}&Year=${year}&UILang=???`;
    return this.http.get<SalarySlipReportApi[]>(url, this.httpOptions).pipe(
      map((response) => SalarySlipAdapter.apiToModel(response[0])),
      tap((data) => {
        if (download) this.downloadPdf(input, data);
      })
    );
  }

  private async downloadPdf(
    input: SalarySlipReportInput,
    data: SalarySlipReport
  ) {
    const table1Data = {
      'Employee Code:': data.employeeCode,
      'Employee Name:': data.fullName,
      'Month:': input.month,
      'Year:': input.year,
      'Employment Date:': this.formatDateToDisplay(
        new Date(data.employmentDate)
      ),
      'Position:': data.position,
      'Department:': data.departmentName,
      'Branch:': data.branch,
    };
    const inputDate = new Date(input.year, input.month - 1);

    const startDate = format(startOfMonth(inputDate), 'dd/MM/yyyy');
    const endDate = format(endOfMonth(inputDate), 'dd/MM/yyyy');

    const table2Data = {
      'Period:': `${startDate}   To   ${endDate}`,
      'Month Days:': data.workUnitNo,
      'Working Days:': `${data.days}    ${data.workUnit}`,
      'Basic Salary:': formatFloat(data.basicSalary, 3),
      'Worth Salary:': formatFloat(data.worthSalary, 3),
      'Paid Vacation:': formatFloat(data.paidVacation, 3),
      'Additional Salary:': formatFloat(data.additionalSalary, 3),
    };
    const table3Data = {
      'Payment Method:': data.payMethod,
    };

    const salarySlipReportJson: PdfJson = {
      fileName: 'Salary Slip Report.pdf',
      pageOptions: {
        marginTop: 90,
        marginBottom: 50,
        marginLeft: 20,
        marginRight: 20,
        landscape: true,
      },
      template: {
        pageMargins: {
          marginTop: 50,
        },
        variables: {
          title: 'Salary Slip Report',
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
                styles: {
                  'font-size': 8,
                  'margin-bottom': 10,
                },
                elements: [
                  {
                    type: 'paragraph',
                    text: 'Page ${pageNumber} of ${totalPages}',
                    styles: {
                      'margin-bottom': 3,
                      'align-content-horizontally': 'end',
                    },
                  },
                  {
                    type: 'paragraph',
                    text: '${date}',
                    styles: {
                      'align-content-horizontally': 'end',
                    },
                  },
                ],
              },
            ],
            styles: {
              'border-bottom': 2,
            },
            widths: ['100%-50', '50'],
          },
        ],
      },
      styles: {
        'font-size': 8,
      },
      elements: [
        {
          type: 'h-container',
          styles: {
            padding: 5,
            'border-bottom': 2,
          },
          widths: ['40%', '30%', '30%'],
          elements: [
            {
              type: 'obj-table',
              data: table1Data,
              rowHeaders: false,
              cellStyles: {
                border: 0,
              },
              headerStyles: {
                'font-weight': 'bold',
                'text-decoration': 'underline',
              },
            },
            {
              type: 'obj-table',
              data: table2Data,
              rowHeaders: false,
              cellStyles: {
                border: 0,
              },
              headerStyles: {
                'font-weight': 'bold',
                'text-decoration': 'underline',
              },
            },
            {
              type: 'obj-table',
              data: table3Data,
              rowHeaders: false,
              cellStyles: {
                border: 0,
              },
              headerStyles: {
                'font-weight': 'bold',
                'text-decoration': 'underline',
              },
            },
          ],
        },
        {
          type: 'h-container',
          styles: {
            margin: 5,
            padding: 2,
            'margin-bottom': 20,
          },
          widths: ['33%', '33%'],
          elements: [
            {
              type: 'h-container',
              widths: ['80%', '20%'],
              styles: {
                'background-color': '#dddddd',
                'margin-right': 60,
              },
              elements: [
                {
                  type: 'p',
                  text: 'Repeatable Allowances Details:',
                  styles: {
                    'font-weight': 'bold',
                    'text-decoration': 'underline',
                  },
                },
                {
                  type: 'p',
                  text: `${data.repeatableAllowance}`,
                },
              ],
            },
            {
              type: 'h-container',
              widths: ['80%', '20%'],
              styles: {
                'background-color': '#dddddd',
                'margin-right': 60,
              },
              elements: [
                {
                  type: 'p',
                  text: 'Repeatable Deductions Details:',
                  styles: {
                    'font-weight': 'bold',
                    'text-decoration': 'underline',
                  },
                },
                {
                  type: 'p',
                  text: `${data.repeatableDeductions}`,
                },
              ],
            },
          ],
        },
        {
          type: 'h-container',
          styles: {
            margin: 5,
            padding: 2,
          },
          widths: ['33%', '33%'],
          elements: [
            {
              type: 'h-container',
              widths: ['80%', '20%'],
              styles: {
                'background-color': '#dddddd',
                'margin-right': 60,
              },
              elements: [
                {
                  type: 'p',
                  text: 'Non-Repeatable Allowances Details:',
                  styles: {
                    'font-weight': 'bold',
                    'text-decoration': 'underline',
                  },
                },
                {
                  type: 'p',
                  text: `${data.nonRepeatableAllowances}`,
                },
              ],
            },
            {
              type: 'h-container',
              widths: ['80%', '20%'],
              styles: {
                'background-color': '#dddddd',
                'margin-right': 60,
              },
              elements: [
                {
                  type: 'p',
                  text: 'Non-Repeatable Deductions Details:',
                  styles: {
                    'font-weight': 'bold',
                    'text-decoration': 'underline',
                  },
                },
                {
                  type: 'p',
                  text: `${data.nonRepeatableDeductions}`,
                },
              ],
            },
          ],
        },
        {
          type: 'h-container',
          styles: {
            position: 'fixed',
            bottom: 0,
            'padding-top': 8,
            'padding-left': 10,
            'padding-right': 10,
            'margin-bottom': 20,
            'border-top': 2,
          },
          widths: ['32%', '36%', '32%'],
          elements: [
            {
              type: 'h-container',
              widths: ['80%', '20%'],
              styles: {
                border: 1,
                padding: 1.5,
                'padding-left': 7,
                'padding-right': 7,
              },
              elements: [
                {
                  type: 'p',
                  text: 'Total Salary:',
                  styles: {
                    'font-weight': 'bold',
                  },
                },
                {
                  type: 'p',
                  text: `${formatFloat(data.totalSalary, 3)}`,
                  styles: {
                    'align-content-horizontally': 'end',
                  },
                },
              ],
            },
            { type: 'v-container', elements: [] },
            {
              type: 'h-container',
              widths: ['80%', '20%'],
              styles: {
                border: 1,
                padding: 1.5,
                'padding-left': 7,
                'padding-right': 7,
              },
              elements: [
                {
                  type: 'p',
                  text: 'Net Salary:',
                  styles: {
                    'font-weight': 'bold',
                  },
                },
                {
                  type: 'p',
                  text: `${formatFloat(data.netSalary, 3)}`,
                  styles: {
                    'align-content-horizontally': 'end',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const parser = new PdfParser();
    const pdfBuilder = parser.parse(salarySlipReportJson);

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

class SalarySlipAdapter {
  static apiToModel(apiSchema: SalarySlipReportApi): SalarySlipReport {
    const obj: SalarySlipReport = {
      docEntry: apiSchema.docEntry,
      lineId: apiSchema.lineId,
      employeeCode: apiSchema.u_EmpCode,
      employeeId: apiSchema.empID,
      fullName: apiSchema.fullName,
      department: apiSchema.department,
      departmentName: apiSchema.departName ?? undefined,
      days: parseInt(apiSchema.u_Days),
      basicSalary: parseFloat(apiSchema.u_BasicSalary),
      workUnitNo: parseFloat(apiSchema.u_WorkUnitNo),
      workUnit: apiSchema.u_WorkUnit,
      worthSalary: parseFloat(apiSchema.u_WorthSalary),
      additionalSalary: parseFloat(apiSchema.u_AdditionalSalary),
      overtime: parseFloat(apiSchema.u_Overtime),
      repeatableAllowance: parseFloat(apiSchema.u_RepAllowance),
      nonRepeatableAllowances: parseFloat(apiSchema.u_NonRepAllowances),
      paidVacation: parseFloat(apiSchema.u_PaidVacation),
      totalSalary: parseFloat(apiSchema.u_TotalSalary),
      repeatableDeductions: parseFloat(apiSchema.u_RepDeductions),
      nonRepeatableDeductions: parseFloat(apiSchema.u_NonRepDeductions),
      incomeTax: parseFloat(apiSchema.u_IncomeTax),
      socialSecurity: parseFloat(apiSchema.u_SocialSecurity),
      netSalary: parseFloat(apiSchema.u_NetSalary),
      workDayOvertimeHoursNo: parseFloat(apiSchema.u_WorkDayOTHoursNo),
      workDayOvertimeHoursValue: parseFloat(apiSchema.u_WorkDayOTHoursVal),
      weekendOvertimeHoursNo: parseFloat(apiSchema.u_WeekendOTHoursNo),
      weekendOvertimeHoursValue: parseFloat(apiSchema.u_WeekendOTHoursVal),
      holidayOvertimeHoursNo: parseFloat(apiSchema.u_HolidayOTHoursNo),
      holidayOvertimeHoursValue: parseFloat(apiSchema.u_HolidayOTHoursVal),
      tieredAllowance: parseFloat(apiSchema.u_TieredAllowance),
      paidUnit: parseFloat(apiSchema.u_PaidUnit),
      endOfService: parseFloat(apiSchema.u_EOS),
      loan: parseFloat(apiSchema.u_Loan),
      sponsorship: apiSchema.u_Sponsorship,
      payMethod: apiSchema.u_PayMethod,
      employmentDate: formatDateToISO(apiSchema.u_EmploymentDate),
      ARNameInReport: apiSchema.u_ARNameInReport,
      ENNameInReport: apiSchema.u_ENNameInReport,
      fromDate: formatDateToISO(apiSchema.u_FromDate),
      toDate: formatDateToISO(apiSchema.u_ToDate),
      object: apiSchema.object,
      fullNameForeign: apiSchema.u_FullNameF,
      position: apiSchema.position ?? undefined,
      positionName: apiSchema.posName ?? undefined,
      branch: apiSchema.branch ?? undefined,
      branchName: apiSchema.branchName ?? undefined,
    };
    return obj;
  }
}
