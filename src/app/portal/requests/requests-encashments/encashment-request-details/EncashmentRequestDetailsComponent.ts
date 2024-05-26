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
  EncashmentRequest,
  EncashmentRequestType,
  EncashmentRequestUpdateSchema,
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

@Component({
  selector: 'app-encashment-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './encashment-request-details.component.html',
  styleUrls: ['./encashment-request-details.component.scss'],
})
export class EncashmentRequestDetailsComponent
  extends DestroyBaseComponent
  implements OnInit, OnChanges
{
  @Input() isEditable: boolean = true;
  @Input({ required: true }) encashmentRequest!: EncashmentRequest;
  @Output() encashmentRequestChange = new EventEmitter<EncashmentRequest>();
  faEdit = faPenToSquare;
  faView = faEye;

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
    this.setFormState();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditable']) {
      this.setFormState();
    }
  }
  ngOnInit(): void {
    this.setInputsDefaultValues();
    this.encashmentRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.encashmentTypes = value;
        // this.encashmentTypes.unshift({
        //   code: '',
        //   name: '',
        // });
      });
    this.projectsService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.projects = value;
      });
    this.updateDynamicValues();
  }

  private setFormState() {
    if (this.isEditable) {
      this.form.enable();
    } else {
      this.form.disable();
    }
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
        });
      if (unitCount) {
        this.encashmentRequestService
          .getEncashValue(encashmentType, unitCount, date)
          .pipe(takeUntil(this.destroy$))
          .subscribe((value) => {
            this.encashValue = value[0];
          });
      }
    }
  }

  private setInputsDefaultValues() {
    this.form
      .get('encashmentType')
      ?.setValue(this.encashmentRequest.encashCode);
    this.form.get('unitPrice')?.setValue(this.encashmentRequest.unitPrice);
    this.form.get('unitCount')?.setValue(this.encashmentRequest.unitCount);
    this.form
      .get('date')
      ?.setValue(datePipe.transform(this.encashmentRequest.date));
    this.form.get('project')?.setValue(this.encashmentRequest.projectCode);
    this.form.get('remarks')?.setValue(this.encashmentRequest.remarks);
  }

  // private updateEncashmentRequestModel() {
  //   const formValues = this.form.value;
  //   this.encashmentRequest = {
  //     ...this.encashmentRequest,
  //     encashmentCode: formValues.encashmentType ?? this.encashmentRequest.encashmentCode,
  //     remarks: formValues.toDate ?? this.encashmentRequest.remarks,
  //   };
  // }
  onSubmit() {
    this.isLoading = true;
    const formValues = this.form.value;
    const data: EncashmentRequestUpdateSchema = {
      docEntry: this.encashmentRequest.encashID,
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
      .update(data)
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
}
