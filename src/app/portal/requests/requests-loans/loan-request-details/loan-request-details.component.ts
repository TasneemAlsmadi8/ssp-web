import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LoanRequest,
  LoanRequestType,
  LoanRequestUpdateSchema,
} from 'src/app/shared/interfaces/requests/loan';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanRequestService } from 'src/app/shared/services/requests/loan.service';
import { takeUntil } from 'rxjs';
import {
  FormValues,
  RequestDetailsComponentTemplate,
} from 'src/app/shared/components/requests/request-details-template.component';
import { limitNumberInput } from 'src/app/shared/utils/form-utils';

@Component({
  selector: 'app-loan-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './loan-request-details.component.html',
  styleUrls: ['./loan-request-details.component.scss'],
})
export class LoanRequestDetailsComponent extends RequestDetailsComponentTemplate<
  LoanRequest,
  LoanRequestUpdateSchema
> {
  loanTypes!: LoanRequestType[];

  constructor(private loanRequestService: LoanRequestService) {
    super(loanRequestService, {
      loanType: ['', [Validators.required]],
      installments: ['', [Validators.required, Validators.min(1)]],
      totalAmount: ['', [Validators.required, Validators.min(1)]],
      startDate: ['', [Validators.required]],
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

  override mapFormToUpdateRequest(formValues: any): LoanRequestUpdateSchema {
    const data: LoanRequestUpdateSchema = {
      docEntry: this.item.loanID,
      u_LoanType: formValues.loanType ?? undefined,
      u_TotalAmount: formValues.totalAmount ?? undefined,
      u_InstallmentCount: formValues.installments ?? undefined,
      u_StartDate: formValues.startDate ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
    };
    return data;
  }
  override mapItemFieldsToFormValues(item: LoanRequest): FormValues {
    return {
      loanType: item.loanCode,
      installments: item.installmentCount,
      totalAmount: item.totalAmount,
      startDate: item.startDate,
      remarks: item.remarks,
    };
  }

  override resetInvalidInputs(): void {
    const installmentCount = this.form.get('installmentCount');
    const totalAmount = this.form.get('totalAmount');
    if (!installmentCount || !totalAmount)
      throw new Error('Invalid form Control');

    limitNumberInput(installmentCount);
    limitNumberInput(totalAmount);
  }
}
