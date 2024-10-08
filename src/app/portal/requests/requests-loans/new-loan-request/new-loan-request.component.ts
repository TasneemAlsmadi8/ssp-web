import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LoanRequestAdd,
  LoanRequest,
  LoanRequestType,
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
import { NewRequestModalComponent } from 'src/app/shared/components/requests/new-request-modal/new-request-modal.component';
import { NewRequestComponentTemplate } from 'src/app/shared/components/requests/new-request-template.component';
import { limitNumberInput } from 'src/app/shared/utils/form-utils';
import { minDate } from 'src/app/shared/utils/date-validators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-new-loan-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    NewRequestModalComponent,
    TranslateModule,
  ],
  templateUrl: './new-loan-request.component.html',
  styleUrls: ['./new-loan-request.component.scss'],
})
export class NewLoanRequestComponent extends NewRequestComponentTemplate<
  LoanRequest,
  LoanRequestAdd
> {
  item: LoanRequest = {
    id: '',
    dateSubmitted: null,
    loanCode: '',
    loanName: null,
    totalAmount: 0,
    installmentCount: 0,
    startDate: '',
    status: 'Pending',
  };

  loanTypes!: LoanRequestType[];

  constructor(private loanRequestService: LoanRequestService) {
    const today = new Date().toISOString().slice(0, 10);
    super(loanRequestService, {
      loanType: ['', [Validators.required]],
      installments: [1, [Validators.required, Validators.min(1)]],
      totalAmount: [0, [Validators.required, Validators.min(1)]],
      startDate: [today, [Validators.required, minDate(new Date(today))]],
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

  override mapFormToAddRequest(formValues: any): LoanRequestAdd {
    const data: LoanRequestAdd = {
      loanCode: formValues.loanType,
      totalAmount: formValues.totalAmount,
      installmentCount: formValues.installments,
      startDate: formValues.startDate,
      remarks: formValues.remarks ?? undefined,
    };
    return data;
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

  override resetInvalidInputs(): void {
    const totalAmountControl = this.form.get('totalAmount');
    const installmentsControl = this.form.get('installments');
    if (!totalAmountControl || !installmentsControl)
      throw new Error('Invalid form control');

    limitNumberInput(totalAmountControl);
    limitNumberInput(installmentsControl);
  }
}
