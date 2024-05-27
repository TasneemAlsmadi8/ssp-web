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
  LeaveRequest,
  LeaveRequestType,
  LeaveRequestUpdateSchema,
} from 'src/app/shared/interfaces/requests/leave';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { faEye, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LocalUserService } from 'src/app/shared/services/local-user.service';
import { User } from 'src/app/shared/interfaces/user';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { formatDateToISO } from 'src/app/shared/utils/data-formatter';
import { RequestDetailsModalComponent } from 'src/app/shared/components/requests/request-details-modal/request-details-modal.component';

@Component({
  selector: 'app-leave-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    RequestDetailsModalComponent,
  ],
  templateUrl: './leave-request-details.component.html',
  styleUrls: ['./leave-request-details.component.scss'],
})
export class LeaveRequestDetailsComponent
  extends DestroyBaseComponent
  implements OnInit, OnChanges
{
  @Input() isEditable: boolean = true;
  @Input() isOpen: boolean = false;
  @Input({ required: true }) leaveRequest!: LeaveRequest;
  // @Output() leaveRequestChange = new EventEmitter<LeaveRequest>();
  faEdit = faPenToSquare;
  faView = faEye;

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
      leaveType: [''],
      fromTime: [''],
      toTime: [''],
      fromDate: [''],
      toDate: [''],
      remarks: [''],
    });
    this.setFormState();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditable']) {
      this.setFormState();
    }
    if (changes['leaveRequest']) {
      this.setInputsDefaultValues();
    }
  }

  private setFormState() {
    if (this.isEditable) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  ngOnInit(): void {
    this.setInputsDefaultValues();
    this.leaveRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.leaveTypes = value;
      });
  }

  private setInputsDefaultValues() {
    this.form.get('leaveType')?.setValue(this.leaveRequest.leaveCode);
    this.form.get('fromTime')?.setValue(this.leaveRequest.fromTime);
    this.form.get('toTime')?.setValue(this.leaveRequest.toTime);
    this.form
      .get('fromDate')
      ?.setValue(formatDateToISO(this.leaveRequest.fromDate));
    this.form
      .get('toDate')
      ?.setValue(formatDateToISO(this.leaveRequest.toDate));
    this.form.get('remarks')?.setValue(this.leaveRequest.remarks);
  }

  // private updateLeaveRequestModel() {
  //   const formValues = this.form.value;
  //   this.leaveRequest = {
  //     ...this.leaveRequest,
  //     leaveCode: formValues.leaveType ?? this.leaveRequest.leaveCode,
  //     fromTime: formValues.fromTime ?? this.leaveRequest.fromTime,
  //     toTime: formValues.toTime ?? this.leaveRequest.toTime,
  //     fromDate: formValues.fromDate ?? this.leaveRequest.fromDate,
  //     toDate: formValues.toDate ?? this.leaveRequest.toDate,
  //     remarks: formValues.toDate ?? this.leaveRequest.remarks,
  //   };
  // }

  onSubmit() {
    this.isLoading = true;
    const formValues = this.form.value;
    const data: LeaveRequestUpdateSchema = {
      docEntry: this.leaveRequest.leaveID,
      u_LeaveType: formValues.leaveType ?? undefined,
      u_FromDate: formValues.fromDate ?? undefined,
      u_ToDate: formValues.toDate ?? undefined,
      u_FromTime: formValues.fromTime ?? undefined,
      u_ToTime: formValues.toTime ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
    };
    // console.log(data);
    this.leaveRequestService
      .update(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // this.updateLeaveRequestModel();
          Swal.fire({
            title: 'Saved!',
            text: 'Information updated successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
          });
          console.log(res);
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

  /** change format from "dd/mm/yyyy" to standard "yyyy-mm-dd" */
  private formatDate(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
}
