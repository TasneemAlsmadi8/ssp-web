import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PdfJson } from '../../utils/pdf-utils/parser/element-json-types';
import { PdfParser } from '../../utils/pdf-utils/parser/pdf-parser';
import {
  RepeatableAllowance,
  RepeatableAllowanceApi,
  RepeatableDeduction,
  RepeatableDeductionApi,
  SalarySlipReport,
  SalarySlipReportApi,
  SalarySlipReportInput,
} from '../../interfaces/reports/salary-slip';
import { formatDateToISO, formatFloat } from '../../utils/data-formatter';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { PdfWorkerService } from '../../workers/pdf-worker.service';

@Injectable({
  providedIn: 'root',
})
export class SalarySlipReportService extends BaseService {
  private endpoint = '/SalaryReport';
  private url = this.baseUrl + this.endpoint;

  constructor(
    private http: HttpClient,
    private pdfWorkerService: PdfWorkerService,
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
  ): Observable<{
    reportData: SalarySlipReport[];
    repAllowanceDetails: RepeatableAllowance[];
    repDeductionsDetails: RepeatableDeduction[];
  }> {
    return forkJoin([
      this.getReportData(input),
      this.getRepeatableAllowanceDetails(input).pipe(
        catchError((error) => {
          console.error('Error in getRepeatableAllowanceDetails:', error);
          return of([]); // Handle error and return an empty array if it fails
        })
      ),
      this.getRepeatableDeductionDetails(input).pipe(
        catchError((error) => {
          console.error('Error in getRepeatableDeductionDetails:', error);
          return of([]); // Handle error and return an empty array if it fails
        })
      ),
    ]).pipe(
      map((data) => {
        return {
          reportData: data[0],
          repAllowanceDetails: data[1],
          repDeductionsDetails: data[2],
        };
      }),
      tap((data) => {
        if (download) this.downloadPdf(input, data);
      })
    );
  }

  private getReportData(
    input: SalarySlipReportInput
  ): Observable<SalarySlipReport[]> {
    let { month, year } = input;
    const url =
      this.url +
      `/GetSalarySlipReport?EmployeeID=${this.user.id}&Month=${month}&Year=${year}&UILang=???`;
    return this.http
      .get<SalarySlipReportApi[]>(url, this.httpOptions)
      .pipe(map((response) => response.map(SalarySlipAdapter.apiToModel)));
  }

  private getRepeatableAllowanceDetails(
    input: SalarySlipReportInput
  ): Observable<RepeatableAllowance[]> {
    let { month, year } = input;
    const url =
      this.url +
      `/GetSalarySlipRepAllowances?EmployeeID=${this.user.id}&Month=${month}&Year=${year}&UILang=???`;
    return this.http
      .get<RepeatableAllowanceApi[]>(url, this.httpOptions)
      .pipe(
        map((response) =>
          response.map(SalarySlipAdapter.repeatableAllowanceApiToModel)
        )
      );
  }
  private getRepeatableDeductionDetails(
    input: SalarySlipReportInput
  ): Observable<RepeatableDeduction[]> {
    let { month, year } = input;
    const url =
      this.url +
      `/GetSalarySlipRepDeductions?EmployeeID=${this.user.id}&Month=${month}&Year=${year}&UILang=???`;
    return this.http
      .get<RepeatableDeductionApi[]>(url, this.httpOptions)
      .pipe(
        map((response) =>
          response.map(SalarySlipAdapter.repeatableDeductionApiToModel)
        )
      );
  }

  private async downloadPdf(
    input: SalarySlipReportInput,
    data: {
      reportData: SalarySlipReport[];
      repAllowanceDetails: RepeatableAllowance[];
      repDeductionsDetails: RepeatableDeduction[];
    }
  ) {
    let {
      reportData: reportDataArray,
      repAllowanceDetails,
      repDeductionsDetails,
    } = data;
    const reportData = reportDataArray[0];
    const table1Data = {
      'Employee Code:': reportData.employeeCode,
      'Employee Name:': reportData.fullName,
      'Month:': input.month,
      'Year:': input.year,
      'Employment Date:': this.formatDateToDisplay(
        new Date(reportData.employmentDate)
      ),
      'Position:': reportData.position,
      'Department:': reportData.departmentName,
      'Branch:': reportData.branch,
    };
    const inputDate = new Date(input.year, input.month - 1);

    const startDate = format(startOfMonth(inputDate), 'dd/MM/yyyy');
    const endDate = format(endOfMonth(inputDate), 'dd/MM/yyyy');

    const table2Data = {
      'Period:': `${startDate}   To   ${endDate}`,
      'Month Days:': reportData.workUnitNo,
      'Working Days:': `${reportData.days}    ${reportData.workUnit}`,
      'Basic Salary:': formatFloat(reportData.basicSalary, 3),
      'Worth Salary:': formatFloat(reportData.worthSalary, 3),
      'Paid Vacation:': formatFloat(reportData.paidVacation, 3),
      'Additional Salary:': formatFloat(reportData.additionalSalary, 3),
    };
    const table3Data = {
      'Payment Method:': reportData.payMethod,
    };

    const repAllowancesTable = repAllowanceDetails.reduce(
      (acc: Record<string, any>, allowance) => {
        acc[allowance.allowanceName] = formatFloat(allowance.value, 3);
        return acc;
      },
      {}
    );
    const repDeductionsTable = repDeductionsDetails.reduce(
      (acc: Record<string, any>, deduction) => {
        acc[deduction.deductionName] = formatFloat(deduction.value, 3);
        return acc;
      },
      {}
    );
    
    const salarySlipReportJson: PdfJson = {
      fileName: 'Salary Slip Report.pdf',
      pageOptions: {
        marginTop: 90,
        marginBottom: 50,
        marginLeft: 20,
        marginRight: 20,
        landscape: true,
      },
      variables: {
        title: 'Salary Slip Report',
        date: this.formatDateToDisplay(new Date()),
      },
      template: {
        pageOptions: {
          marginTop: 50,
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
        'font-size': 9,
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
          widths: ['35%', '35%'],
          elements: [
            {
              type: 'v-container',
              styles: {
                'padding-right': 60,
              },
              elements: [
                {
                  type: 'p',
                  text: 'Repeatable Allowances Details:',
                  styles: {
                    'font-weight': 'bold',
                    'text-decoration': 'underline',
                    'background-color': '#dddddd',
                  },
                },
                {
                  type: 'obj-table',
                  data: repAllowancesTable,
                  rowHeaders: false,
                  styles: {
                    'padding-bottom': 3,
                    'border-bottom': 1.3,
                  },
                  cellStyles: {
                    border: 0,
                    'align-content-horizontally': 'end',
                  },
                  headerStyles: {
                    'align-content-horizontally': 'start',
                  },
                },
                {
                  type: 'obj-table',
                  data: {
                    Total: formatFloat(reportData.repeatableAllowance, 3),
                  },
                  rowHeaders: false,
                  cellStyles: {
                    border: 0,
                    'font-weight': 'bold',
                    'align-content-horizontally': 'end',
                  },
                  headerStyles: {
                    'align-content-horizontally': 'start',
                  },
                },
              ],
            },
            {
              type: 'v-container',
              styles: {
                'padding-right': 60,
                // font: 'Noto Sans',
              },
              elements: [
                {
                  type: 'p',
                  text: 'Repeatable Deductions Details:',
                  styles: {
                    'font-weight': 'bold',
                    'text-decoration': 'underline',
                    'background-color': '#dddddd',
                  },
                },
                {
                  type: 'obj-table',
                  data: repDeductionsTable,
                  rowHeaders: false,
                  styles: {
                    'padding-bottom': 3,
                    'border-bottom': 1.3,
                  },
                  cellStyles: {
                    border: 0,
                    'align-content-horizontally': 'end',
                  },
                  headerStyles: {
                    'align-content-horizontally': 'start',
                  },
                },
                {
                  type: 'obj-table',
                  data: {
                    Total: formatFloat(reportData.repeatableDeductions, 3),
                  },
                  rowHeaders: false,
                  cellStyles: {
                    border: 0,
                    'font-weight': 'bold',
                    'align-content-horizontally': 'end',
                  },
                  headerStyles: {
                    'align-content-horizontally': 'start',
                  },
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
          widths: ['35%', '35%'],
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
                  text: `${reportData.nonRepeatableAllowances}`,
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
                  text: `${reportData.nonRepeatableDeductions}`,
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
            'font-weight': 'bold',
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
                },
                {
                  type: 'p',
                  text: `${formatFloat(reportData.totalSalary, 3)}`,
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
                'font-weight': 'bold',
              },
              elements: [
                {
                  type: 'p',
                  text: 'Net Salary:',
                },
                {
                  type: 'p',
                  text: `${formatFloat(reportData.netSalary, 3)}`,
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

    await this.pdfWorkerService.download(salarySlipReportJson, data, input);
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
  static repeatableAllowanceApiToModel(
    apiSchema: RepeatableAllowanceApi
  ): RepeatableAllowance {
    const obj: RepeatableAllowance = {
      employeeId: apiSchema.u_empID.toString(),
      code: apiSchema.code,
      name: apiSchema.name,
      batchNumber: apiSchema.u_BatchNo,
      value: apiSchema.u_Value,
      totalValue: apiSchema.u_TotValue,
      allowanceId: apiSchema.u_AllowID,
      allowanceName: apiSchema.allowanceName,
      isAdditionalSalary: apiSchema.u_IsAddSal,
    };
    return obj;
  }
  static repeatableDeductionApiToModel(
    apiSchema: RepeatableDeductionApi
  ): RepeatableDeduction {
    const obj: RepeatableDeduction = {
      employeeId: apiSchema.u_empID.toString(),
      code: apiSchema.code,
      name: apiSchema.name,
      batchNumber: apiSchema.u_BatchNo,
      value: apiSchema.u_Value,
      companyValue: apiSchema.u_CompValue,
      deductionId: apiSchema.u_DeductID,
      deductionName: apiSchema.deductionName,
    };
    return obj;
  }
}
