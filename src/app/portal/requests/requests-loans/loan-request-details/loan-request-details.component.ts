import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LoanRequest,
  LoanRequestType,
  LoanRequestUpdate,
} from 'src/app/shared/interfaces/requests/loan';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  AbstractControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoanRequestService } from 'src/app/shared/services/requests/loan.service';
import { takeUntil } from 'rxjs';
import {
  FormValues,
  RequestDetailsComponentTemplate,
} from 'src/app/shared/components/requests/request-details-template.component';
import { limitNumberInput } from 'src/app/shared/utils/form-utils';
import { TranslateModule } from '@ngx-translate/core';
import { minDate } from 'src/app/shared/utils/date-validators';

@Component({
  selector: 'app-loan-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './loan-request-details.component.html',
  styleUrls: ['./loan-request-details.component.scss'],
})
export class LoanRequestDetailsComponent extends RequestDetailsComponentTemplate<
  LoanRequest,
  LoanRequestUpdate
> {
  loanTypes!: LoanRequestType[];

  constructor(private loanRequestService: LoanRequestService) {
    const today = new Date().toISOString().slice(0, 10);
    super(loanRequestService, {
      loanType: ['', [Validators.required]],
      installments: ['', [Validators.required, Validators.min(1)]],
      totalAmount: ['', [Validators.required, Validators.min(1)]],
      startDate: ['', [Validators.required, minDate(new Date(today))]],
      remarks: [''],
    });
  }

  override getDynamicValues(): void {
    this.loanRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.loanTypes = value;
      });
  }

  override mapFormToUpdateRequest(formValues: any): LoanRequestUpdate {
    const data: LoanRequestUpdate = {
      id: this.item.id,
      loanCode: formValues.loanType ?? undefined,
      totalAmount: formValues.totalAmount?.toString() ?? undefined,
      installmentCount: formValues.installments?.toString() ?? undefined,
      startDate: formValues.startDate ?? undefined,
      remarks: formValues.remarks ?? undefined,
    };
    return data;
  }
  override mapItemFieldsToFormValues(
    item: LoanRequest
  ): FormValues<typeof this.formControls> {
    return {
      loanType: item.loanCode,
      installments: item.installmentCount,
      totalAmount: item.totalAmount,
      startDate: item.startDate,
      remarks: item.remarks,
    };
  }

  override resetInvalidInputs(): void {
    const installmentCount = this.form.get('installments');
    const totalAmount = this.form.get('totalAmount');
    if (!installmentCount || !totalAmount)
      throw new Error('Invalid form Control');

    limitNumberInput(installmentCount);
    limitNumberInput(totalAmount);
  }
  override additionalErrorMessages(
    control: AbstractControl<any, any>,
    inputTitle: string
  ): string | null {
    if (control.hasError('minDate')) {
      const date: Date = control.getError('minDate');
      return `Start date can not be in the past`;
    }

    return null;
  }
}
