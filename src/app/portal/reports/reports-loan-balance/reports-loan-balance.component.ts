import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { UserAlertService } from 'src/app/shared/services/user-alert.service';
import { FormErrorMessageBehavior } from 'src/app/shared/components/FormErrorMessage';
import { CommonModule } from '@angular/common';
import { LoanBalanceReportService } from 'src/app/shared/services/reports/loan-balance.service';
import { LoanRequestType } from 'src/app/shared/interfaces/requests/loan';

@Component({
  selector: 'app-reports-loan-balance',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './reports-loan-balance.component.html',
  styleUrls: ['./reports-loan-balance.component.scss'],
})
export class ReportsLoanBalanceComponent extends DestroyBaseComponent {
  loanTypes: LoanRequestType[] = [];
  isLoading = false;

  constructor(
    private loanBalanceService: LoanBalanceReportService,
    private userAlertService: UserAlertService
  ) {
    super();
    const today = new Date().toISOString().slice(0, 10);
  }

  onSubmit() {
    this.isLoading = true;
    this.loanBalanceService
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
