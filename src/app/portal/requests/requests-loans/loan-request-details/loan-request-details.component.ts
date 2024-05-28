import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LoanRequest,
  LoanRequestType,
  LoanRequestUpdateSchema,
} from 'src/app/shared/interfaces/requests/loan';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { faEye, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LocalUserService } from 'src/app/shared/services/local-user.service';
import { User } from 'src/app/shared/interfaces/user';
import { LoanRequestService } from 'src/app/shared/services/requests/loan.service';
import { takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { RequestDetailsModalComponent } from 'src/app/shared/components/requests/request-details-modal/request-details-modal.component';
import { RequestDetailsComponentTemplate } from 'src/app/shared/components/requests/request-details-template.component';

@Component({
  selector: 'app-loan-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    RequestDetailsModalComponent,
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
      loanType: [''],
      installments: [''],
      totalAmount: [''],
      startDate: [''],
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
  override mapItemFieldsToFormValues(item: LoanRequest): {
    [key: string]: string | number | null;
  } {
    return {
      loanType: item.loanCode,
      installments: item.installmentCount,
      totalAmount: item.totalAmount,
      startDate: item.startDate,
      remarks: item.remarks,
    };
  }
  // private setInputsDefaultValues() {
  //   this.form.get('loanType')?.setValue(this.loanRequest.loanCode);
  //   this.form.get('installments')?.setValue(this.loanRequest.installmentCount);
  //   this.form.get('totalAmount')?.setValue(this.loanRequest.totalAmount);
  //   this.form.get('startDate')?.setValue(this.loanRequest.startDate);
  //   this.form.get('remarks')?.setValue(this.loanRequest.remarks);
  // }

  // private updateLoanRequestModel() {
  //   const formValues = this.form.value;
  //   this.loanRequest = {
  //     ...this.loanRequest,
  //     loanCode: formValues.loanType ?? this.loanRequest.loanCode,
  //     remarks: formValues.toDate ?? this.loanRequest.remarks,
  //   };
  // }

  // onSubmit() {
  //   this.isLoading = true;
  //   const formValues = this.form.value;
  //   const data: LoanRequestUpdateSchema = {
  //     docEntry: this.loanRequest.loanID,
  //     u_LoanType: formValues.loanType ?? undefined,
  //     u_TotalAmount: formValues.totalAmount ?? undefined,
  //     u_InstallmentCount: formValues.installments ?? undefined,
  //     u_StartDate: formValues.startDate ?? undefined,
  //     u_Remarks: formValues.remarks ?? undefined,
  //   };
  //   this.loanRequestService
  //     .update(data)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (res) => {
  //         // this.updateLoanRequestModel();
  //         Swal.fire({
  //           title: 'Saved!',
  //           text: 'Information updated successfully',
  //           icon: 'success',
  //           confirmButtonText: 'Ok',
  //         });
  //         console.log(res);
  //       },
  //       error: (err: HttpErrorResponse) => {
  //         Swal.fire({
  //           title: 'Error!',
  //           // text: 'Unknown error: ' + err.status,
  //           icon: 'error',
  //           confirmButtonText: 'Ok',
  //         });
  //         console.log(err);
  //       },
  //     })
  //     .add(() => {
  //       this.isLoading = false;
  //     });
  // }
}
