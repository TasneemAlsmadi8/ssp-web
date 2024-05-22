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
  LoanRequestAddSchema,
  LoanRequest,
  LoanRequestType,
} from 'src/app/shared/interfaces/requests/loan';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { faEye, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LocalUserService } from 'src/app/shared/services/local-user.service';
import { User } from 'src/app/shared/interfaces/user';
import { LoanRequestService } from 'src/app/shared/services/requests/loan.service';
import { takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-loan-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './new-loan-request.component.html',
  styleUrls: ['./new-loan-request.component.scss'],
})
export class NewLoanRequestComponent
  extends DestroyBaseComponent
  implements OnInit
{
  @Output() onSave = new EventEmitter<LoanRequest>();
  faEdit = faPenToSquare;
  faView = faEye;

  loanRequest: LoanRequest = {
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

  isLoading = false;
  user: User;
  loanTypes!: LoanRequestType[];
  form: FormGroup;

  constructor(
    private userService: LocalUserService,
    private loanRequestService: LoanRequestService,
    private fb: FormBuilder
  ) {
    super();
    this.user = this.userService.getUser();
    this.form = this.fb.group({
      loanType: [''],
      installments: [''],
      totalAmount: [''],
      startDate: [''],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.setInputsDefaultValues();
    this.loanRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.loanTypes = value;
      });
  }

  private setInputsDefaultValues() {
    const today = new Date().toISOString().slice(0, 10);
    this.form.get('loanType')?.setValue('');
    this.form.get('installments')?.setValue(1);
    this.form.get('totalAmount')?.setValue(0);
    this.form.get('startDate')?.setValue(today);
    this.form.get('remarks')?.setValue('');
  }
  // private updateLoanRequestModel() {
  //   const formValues = this.form.value;
  //   this.loanRequest = {
  //     ...this.loanRequest,
  //     loanCode: formValues.loanType ?? this.loanRequest.loanCode,
  //     fromTime: formValues.fromTime ?? this.loanRequest.fromTime,
  //     toTime: formValues.toTime ?? this.loanRequest.toTime,
  //     fromDate: formValues.fromDate ?? this.loanRequest.fromDate,
  //     toDate: formValues.toDate ?? this.loanRequest.toDate,
  //     remarks: formValues.toDate ?? this.loanRequest.remarks,
  //   };
  // }

  onSubmit() {
    this.isLoading = true;
    const formValues = this.form.value;
    const data: LoanRequestAddSchema = {
      u_EmployeeID: 0,
      u_LoanType: formValues.loanType ?? undefined,
      u_TotalAmount: formValues.totalAmount ?? undefined,
      u_InstallmentCount: formValues.installments ?? undefined,
      u_StartDate: formValues.startDate ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
    };
    this.loanRequestService
      .add(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // this.updateLoanRequestModel();
          Swal.fire({
            title: 'Saved!',
            text: 'Information updated successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
          });
        },
        error: (err: HttpErrorResponse) => {
          Swal.fire({
            title: 'Error!',
            // text: 'Unknown error: ' + err.status,
            icon: 'error',
            confirmButtonText: 'Ok',
          });
          console.log(err);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
