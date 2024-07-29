import { Injectable } from '@angular/core';
import { BaseService } from '../../base/base.service';
import { HttpClient } from '@angular/common/http';
import { LocalUserService } from '../local-user.service';
import { Observable, tap } from 'rxjs';
import { UserAlertService } from '../user-alert.service';
import { PdfWorkerService } from '../../workers/pdf-worker.service';
import { PdfVariableResolver } from '../../utils/pdf-utils/parser/pdf-variable-resolver';
import { SalaryHistoryReport } from '../../interfaces/reports/salary-history';

@Injectable({
  providedIn: 'root',
})
export class SalaryHistoryReportService extends BaseService {
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

  getReport(download: boolean = true): Observable<SalaryHistoryReport[]> {
    const url = this.url + `/SalaryHistoryReport?EmployeeID=${this.user.id}`;
    if (download) this.userAlertService.showLoading('Generating Report...');
    return this.http.get<SalaryHistoryReport[]>(url, this.httpOptions).pipe(
      tap((data) => {
        if (download) {
          this.downloadPdf(data).then(() => {
            this.userAlertService.showSuccess(
              'Report Downloaded Successfully.'
            );
          });
        }
      })
    );
  }

  private async downloadPdf(data: SalaryHistoryReport[]) {
    let totalCredit = 0;
    let totalDebit = 0;
    data = data.map((value) => {
      value.toDate = value.toDate ?? '';
      return value;
    });

    let employeeInfo = {};
    if (data.length > 0) {
      employeeInfo = {
        ...data[0],
      };
    }

    const basicSalaryData: SalaryHistoryReport[] = [];
    const repeatableAllowanceData = [];
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (element.order === 'ABS_BasicSalary') {
        data.splice(i, 1);
        basicSalaryData.push(element);
        i--;
      } else if (element.order === 'ABS_Others') {
        data.splice(i, 1);
        repeatableAllowanceData.push(element);
        i--;
      }
    }

    basicSalaryData.sort((a, b) => {
      return new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime();
    });

    basicSalaryData.forEach((element, index) => {
      if (index > 0) {
        const prevValue = parseFloat(basicSalaryData[index - 1].value);
        element['raiseValue'] = parseFloat(element.value) - prevValue;
      } else {
        element['raiseValue'] = 0; // First element
      }
      if (element.name === 'ABS_BasicSalary') element.name = 'Basic Salary';
    });

    console.log('Basic salary', basicSalaryData);

    const dataProcessed = {
      basicSalary: basicSalaryData,
      repeatableAllowance: repeatableAllowanceData,
      employeeInfo: [employeeInfo],
    };

    const additionalVars = {
      totalCredit,
      totalDebit,
    };
    await this.pdfWorkerService.downloadFromFile(
      '/assets/report-json/salary-history.pdf.json',
      dataProcessed,
      undefined,
      additionalVars
    );
  }
}
