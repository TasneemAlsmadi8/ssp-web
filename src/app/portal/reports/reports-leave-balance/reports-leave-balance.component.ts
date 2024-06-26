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
import { LeaveBalanceReportService } from 'src/app/shared/services/reports/leave-balance.service';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { LeaveRequestType } from 'src/app/shared/interfaces/requests/leave';

@Component({
  selector: 'app-reports-leave-balance',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, CommonModule],
  templateUrl: './reports-leave-balance.component.html',
  styleUrls: ['./reports-leave-balance.component.scss'],
})
export class ReportsLeaveBalanceComponent
  extends DestroyBaseComponent
  implements OnInit, FormErrorMessageBehavior
{
  form: FormGroup;

  leaveTypes: LeaveRequestType[] = [];
  isLoading = false;

  constructor(
    private leaveBalanceService: LeaveBalanceReportService,
    private leaveService: LeaveRequestService,
    private userAlertService: UserAlertService,
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) {
    super();
    const today = new Date().toISOString().slice(0, 10);
    this.form = this.formBuilder.group({
      leaveType: ['', [Validators.required]],
      toDate: [today, [Validators.required]],
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
    this.leaveService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.leaveTypes = value;
        },
      });
  }

  onSubmit() {
    this.isLoading = true;
    const { leaveType, toDate } = this.form.value;
    const input = { leaveCode: leaveType, toDate };
    this.leaveBalanceService
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
          console.log(err);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
