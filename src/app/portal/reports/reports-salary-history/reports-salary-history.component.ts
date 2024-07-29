import { Component } from '@angular/core';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { UserAlertService } from 'src/app/shared/services/user-alert.service';
import { CommonModule } from '@angular/common';
import { SalaryHistoryReportService } from 'src/app/shared/services/reports/salary-history.service';
import { LoanRequestType } from 'src/app/shared/interfaces/requests/loan';

@Component({
  selector: 'app-reports-salary-history',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './reports-salary-history.component.html',
  styleUrls: ['./reports-salary-history.component.scss'],
})
export class ReportsSalaryHistoryComponent extends DestroyBaseComponent {
  loanTypes: LoanRequestType[] = [];
  isLoading = false;

  constructor(
    private salaryHistoryService: SalaryHistoryReportService,
    private userAlertService: UserAlertService
  ) {
    super();
  }

  onSubmit() {
    this.isLoading = true;
    this.salaryHistoryService
      .getReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err: HttpErrorResponse) => {
          this.userAlertService.showError(
            'Error!',
            'No data returned for the report'
          );
          console.log(err);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
