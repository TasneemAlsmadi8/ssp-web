import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LoanRequestAddSchema,
  LoanRequest,
  LoanRequestType,
} from 'src/app/shared/interfaces/requests/loan';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { LoanRequestService } from 'src/app/shared/services/requests/loan.service';
import { takeUntil } from 'rxjs';
import { NewRequestModalComponent } from 'src/app/shared/components/requests/new-request-modal/new-request-modal.component';
import { NewRequestComponentTemplate } from 'src/app/shared/components/requests/new-request-template.component';

@Component({
  selector: 'app-new-loan-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    NewRequestModalComponent,
  ],
  templateUrl: './new-loan-request.component.html',
  styleUrls: ['./new-loan-request.component.scss'],
})
export class NewLoanRequestComponent
  extends NewRequestComponentTemplate<LoanRequest, LoanRequestAddSchema>
{

  item: LoanRequest = {
    loanID: '',
    dateSubmitted: null,
    empID: null,
    loanCode: '',
    empCode: null,
    fullName: null,
    fullNameF: null,
    loanName: null,
    totalAmount: '',
    installmentCount: '',
    startDate: '',
    statusID: null,
    status: '',
    remarks: null,
  };

  loanTypes!: LoanRequestType[];

  constructor(private loanRequestService: LoanRequestService) {
    const today = new Date().toISOString().slice(0, 10);
    super(loanRequestService, {
      loanType: [''],
      installments: [1],
      totalAmount: [0],
      startDate: [today],
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

  override mapFormToAddRequest(formValues: any): LoanRequestAddSchema {
    const data: LoanRequestAddSchema = {
      u_EmployeeID: 0,
      u_LoanType: formValues.loanType ?? undefined,
      u_TotalAmount: formValues.totalAmount?.toString() ?? undefined,
      u_InstallmentCount: formValues.installments?.toString() ?? undefined,
      u_StartDate: formValues.startDate ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
    };
    return data;
  }
}
