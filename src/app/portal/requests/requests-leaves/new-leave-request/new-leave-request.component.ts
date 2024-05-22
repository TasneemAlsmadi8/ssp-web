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
  LeaveRequestAddSchema,
  LeaveRequest,
  LeaveRequestType,
  LeaveRequestUpdateSchema,
  LeaveRequestBalance,
} from 'src/app/shared/interfaces/requests/leave';
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
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-leave-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './new-leave-request.component.html',
  styleUrls: ['./new-leave-request.component.scss'],
})
export class NewLeaveRequestComponent
  extends DestroyBaseComponent
  implements OnInit
{
  @Output() onSave = new EventEmitter<LeaveRequest>();
  faEdit = faPenToSquare;
  faView = faEye;

  leaveRequest: LeaveRequest = {
    leaveID: '',
    u_EmployeeID: '',
    leaveType: '',
    fromDate: '',
    toDate: '',
    statusTypeId: '',
    fromTime: null,
    toTime: null,
    status: '',
    remarks: null,
    leaveCode: '',
    u_Status: '',
    u_ApprStatus1: '',
    u_ApprStatus2: null,
    u_ApprStatus3: null,
    u_PaidDays: '1',
    u_UnpaidDays: '1',
    u_AttachFile: '',
    sortFromDate: '',
    sortToDate: '',
  };

  leaveBalance?: LeaveRequestBalance;
  leaveBalanceEndOfYear?: LeaveRequestBalance;

  isLoading = false;
  user: User;
  leaveTypes!: LeaveRequestType[];
  form: FormGroup;

  constructor(
    private userService: LocalUserService,
    private leaveRequestService: LeaveRequestService,
    private fb: FormBuilder
  ) {
    super();
    this.user = this.userService.getUser();
    this.form = this.fb.group({
      leaveType: ['', Validators.required],
      fromTime: ['', Validators.required],
      toTime: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.setInputsDefaultValues();
    this.leaveRequestService
      .getLeaveTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.leaveTypes = value;
      });
  }

  updateLeaveBalance() {
    const fromDate = this.form.get('fromDate')?.value;
    const leaveType = this.form.get('leaveType')?.value;

    if (fromDate && leaveType) {
      this.leaveRequestService
        .getLeaveBalance(leaveType, fromDate)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.leaveBalance = value[0];
        });
    }
    if (leaveType) {
      const endOfYearDate = `${new Date().getFullYear()}-12-31`;
      this.leaveRequestService
        .getLeaveBalance(leaveType, endOfYearDate)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.leaveBalanceEndOfYear = value[0];
        });
    }
  }

  private setInputsDefaultValues() {
    const today = new Date().toISOString().slice(0, 10);
    this.form.get('leaveType')?.setValue('');
    this.form.get('fromTime')?.setValue('08:00');
    this.form.get('toTime')?.setValue('08:00');
    this.form.get('fromDate')?.setValue(today);
    this.form.get('toDate')?.setValue(today);
    this.form.get('remarks')?.setValue('');
  }

  private updateLeaveRequestModel() {
    const formValues = this.form.value;
    this.leaveRequest = {
      ...this.leaveRequest,
      leaveCode: formValues.leaveType ?? this.leaveRequest.leaveCode,
      fromTime: formValues.fromTime ?? this.leaveRequest.fromTime,
      toTime: formValues.toTime ?? this.leaveRequest.toTime,
      fromDate: formValues.fromDate ?? this.leaveRequest.fromDate,
      toDate: formValues.toDate ?? this.leaveRequest.toDate,
      remarks: formValues.toDate ?? this.leaveRequest.remarks,
    };
  }

  onSubmit() {
    this.isLoading = true;
    const formValues = this.form.value;
    const data: LeaveRequestAddSchema = {
      u_LeaveType: formValues.leaveType ?? undefined,
      u_FromDate: formValues.fromDate ?? undefined,
      u_ToDate: formValues.toDate ?? undefined,
      u_FromTime: formValues.fromTime ?? undefined,
      u_ToTime: formValues.toTime ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
      u_EmployeeID: '',
    };
    this.leaveRequestService
      .addLeaveRequest(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.updateLeaveRequestModel();
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
