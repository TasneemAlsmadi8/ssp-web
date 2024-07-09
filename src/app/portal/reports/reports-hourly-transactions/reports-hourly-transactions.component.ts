import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserAlertService } from 'src/app/shared/services/user-alert.service';
import { FormErrorMessageBehavior } from 'src/app/shared/components/FormErrorMessage';
import { CommonModule } from '@angular/common';
import { HourlyTransactionReportService } from 'src/app/shared/services/reports/hourly-transaction.service';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { LeaveRequestType } from 'src/app/shared/interfaces/requests/leave';
import { add } from 'date-fns';
import { HourlyTransactionType } from 'src/app/shared/interfaces/reports/hourly-transaction';

@Component({
  selector: 'app-reports-hourly-transactions',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, CommonModule],
  templateUrl: './reports-hourly-transactions.component.html',
  styleUrls: ['./reports-hourly-transactions.component.scss'],
})
export class ReportsHourlyTransactionsComponent
  extends DestroyBaseComponent
  implements OnInit, FormErrorMessageBehavior
{
  form: FormGroup;

  transactionTypes: HourlyTransactionType[] = [];
  isLoading = false;

  constructor(
    private hourlyTransactionService: HourlyTransactionReportService,
    private userAlertService: UserAlertService,
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) {
    super();
    const today = new Date();
    this.form = this.formBuilder.group({
      transactionType: [''],
      fromDate: [
        add(today, { days: -30 }).toISOString().slice(0, 10),
        [Validators.required],
      ],
      toDate: [today.toISOString().slice(0, 10), [Validators.required]],
    });
  }
  shouldDisplayError(formControlName: string, onlyDirty = false): boolean {
    const control = this.form.get(formControlName);
    if (!control) throw new Error('Invalid form Control');

    if (onlyDirty) return control.invalid && control.dirty;
    return control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(
    formControlName: string,
    inputTitle: string = 'Value',
    customMessage: string = ''
  ): string {
    const control = this.form.get(formControlName);
    if (!control) throw new Error('Invalid form control');

    inputTitle = this.translate.instant(inputTitle);
    if (customMessage) customMessage = this.translate.instant(customMessage);

    if (control.hasError('required')) {
      return `${inputTitle} ${this.translate.instant(
        'is required'
      )}.${customMessage}`;
    }
    return '';
  }

  ngOnInit(): void {
    this.transactionTypes.push({
      name: 'All',
      code: '',
    });
    // this.leaveService
    //   .getTypes()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (value) => {
    //       this.leaveTypes = value;
    //     },
    //   });
  }

  onSubmit() {
    this.isLoading = true;
    const { transactionType, fromDate, toDate } = this.form.value;
    const input = { transactionType, toDate, fromDate };
    this.hourlyTransactionService
      .getReport(input)
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
          console.error(err.error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
