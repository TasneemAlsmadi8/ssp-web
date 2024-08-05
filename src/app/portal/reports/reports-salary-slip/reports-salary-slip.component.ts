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
import { SalarySlipReportService } from 'src/app/shared/services/reports/salary-slip.service';

@Component({
  selector: 'app-reports-salary-slip',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, CommonModule],
  templateUrl: './reports-salary-slip.component.html',
  styleUrls: ['./reports-salary-slip.component.scss'],
})
export class ReportsSalarySlipComponent
  extends DestroyBaseComponent
  implements OnInit, FormErrorMessageBehavior
{
  form: FormGroup;

  isLoading = false;
  showAllErrors = false;

  constructor(
    private salarySlipService: SalarySlipReportService,
    private userAlertService: UserAlertService,
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) {
    super();
    const today = new Date();
    this.form = this.formBuilder.group({
      month: [1, [Validators.required]],
      year: [today.getFullYear(), [Validators.required]],
    });
  }
  shouldDisplayError(formControlName: string, onlyDirty = false): boolean {
    const control = this.form.get(formControlName);
    if (!control) throw new Error('Invalid form Control');

    if (this.showAllErrors) return control.invalid;
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
    if (this.form.invalid) {
      this.showAllErrors = true;
      return;
    }
    this.isLoading = true;
    const { month, year } = this.form.value;
    const input = { month, year };
    this.salarySlipService
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
