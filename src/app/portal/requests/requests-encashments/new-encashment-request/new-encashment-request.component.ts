import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EncashmentRequest,
  EncashmentRequestAddSchema,
  EncashmentRequestType,
  EncashmentValue,
} from 'src/app/shared/interfaces/requests/encashment';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { faEye, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LocalUserService } from 'src/app/shared/services/local-user.service';
import { User } from 'src/app/shared/interfaces/user';
import { EncashmentRequestService } from 'src/app/shared/services/requests/encashment.service';
import { takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Project } from 'src/app/shared/interfaces/project';
import { ProjectsService } from 'src/app/shared/services/projects.service';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { LeaveRequestBalance } from 'src/app/shared/interfaces/requests/leave';
import { NewRequestModalComponent } from 'src/app/shared/components/new-request-modal/new-request-modal.component';

@Component({
  selector: 'app-new-encashment-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    NewRequestModalComponent,
  ],
  templateUrl: './new-encashment-request.component.html',
  styleUrls: ['./new-encashment-request.component.scss'],
})
export class NewEncashmentRequestComponent
  extends DestroyBaseComponent
  implements OnInit
{
  @Output() onSave = new EventEmitter<EncashmentRequest>();

  encashmentRequest: EncashmentRequest = {
    encashID: '',
    u_EmployeeID: '',
    encashName: '',
    value: '',
    date: '',
    status: '',
    remarks: '',
    encashCode: '',
    u_Status: null,
    createDate: '',
    u_ApprStatus1: null,
    u_ApprStatus2: null,
    u_ApprStatus3: null,
    projectCode: '',
    unitPrice: '',
    unitCount: '',
    loanID: null,
    installmentCount: null,
    sortDate: '',
    u_AttachFile: '',
  };

  isLoading = false;
  user: User;

  encashmentTypes: EncashmentRequestType[] = [];
  projects: Project[] = [];
  leaveBalance?: LeaveRequestBalance;
  encashValue?: EncashmentValue;

  form: FormGroup;

  constructor(
    private userService: LocalUserService,
    private encashmentRequestService: EncashmentRequestService,
    private leaveRequestService: LeaveRequestService,
    private projectsService: ProjectsService,
    private fb: FormBuilder
  ) {
    super();
    this.user = this.userService.getUser();
    this.form = this.fb.group({
      encashmentType: [''],
      unitPrice: [''],
      date: [''],
      unitCount: [''],
      project: [''],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.setInputsDefaultValues();
    this.encashmentRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.encashmentTypes = value;
        this.encashmentTypes.unshift({
          code: '',
          name: '',
        });
      });
    this.projectsService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.projects = value;
      });
  }

  updateDynamicValues() {
    const date = this.form.get('date')?.value;
    const encashmentType = this.form.get('encashmentType')?.value;
    const unitCount = this.form.get('unitCount')?.value;
    if (date && encashmentType) {
      this.leaveRequestService
        .getBalance(encashmentType, date)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.leaveBalance = value[0];
          console.log(this.leaveBalance.leaveBalance + ' balance');
        });
      if (unitCount) {
        this.encashmentRequestService
          .getEncashValue(encashmentType, unitCount, date)
          .pipe(takeUntil(this.destroy$))
          .subscribe((value) => {
            this.encashValue = value[0];
            console.log(this.encashValue);
          });
      }
    }
  }

  private setInputsDefaultValues() {
    const today = new Date().toISOString().slice(0, 10);
    this.form.get('encashmentType')?.setValue('');
    this.form.get('unitPrice')?.setValue(0);
    this.form.get('unitCount')?.setValue(0);
    this.form.get('date')?.setValue(today);
    this.form.get('project')?.setValue('');
    this.form.get('remarks')?.setValue('');
  }

  onSubmit() {
    this.isLoading = true;
    const formValues = this.form.value;
    const data: EncashmentRequestAddSchema = {
      u_EmployeeID: '',
      // u_EncashValue:
      // this.encashValue?.paidVacationValue.toString() ?? undefined,
      // TODO: should I send it?
      u_EncashType: formValues.encashmentType ?? undefined,
      u_Date: formValues.date ?? undefined,
      u_UnitPrice: formValues.unitPrice?.toString() ?? undefined,
      u_UnitCount: formValues.unitCount?.toString() ?? undefined,
      u_ProjectCode: formValues.project ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
    };
    this.encashmentRequestService
      .add(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // this.updateEncashmentRequestModel();
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
        this.setInputsDefaultValues();
      });
  }
}
