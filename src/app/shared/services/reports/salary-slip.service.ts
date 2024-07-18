import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import {
  RepeatableAllowance,
  RepeatableAllowanceApi,
  RepeatableDeduction,
  RepeatableDeductionApi,
  SalarySlipReport,
  SalarySlipReportApi,
  SalarySlipReportInput,
} from '../../interfaces/reports/salary-slip';
import { formatDateToISO } from '../../utils/data-formatter';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { PdfWorkerService } from '../../workers/pdf-worker.service';
import { UserAlertService } from '../user-alert.service';

@Injectable({
  providedIn: 'root',
})
export class SalarySlipReportService extends BaseService {
  private endpoint = '/SalaryReport';
  private url = this.baseUrl + this.endpoint;

  constructor(
    private http: HttpClient,
    private pdfWorkerService: PdfWorkerService,
    private userAlertService: UserAlertService,
    private userService: LocalUserService
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
    if (download) this.userAlertService.showLoading('Generating Report...');
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
    const inputDate = new Date(input.year, input.month - 1);

    const startDate = format(startOfMonth(inputDate), 'dd/MM/yyyy');
    const endDate = format(endOfMonth(inputDate), 'dd/MM/yyyy');

    await this.pdfWorkerService.downloadFromFile(
      '/assets/report-json/salary-slip.pdf.json',
      data,
      input,
      {
        startDate,
        endDate,
      }
    );
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
      departmentName: apiSchema.departName ?? '-',
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
      position: apiSchema.position ?? '-',
      positionName: apiSchema.posName ?? '-',
      branch: apiSchema.branch ?? '-',
      branchName: apiSchema.branchName ?? '-',
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
