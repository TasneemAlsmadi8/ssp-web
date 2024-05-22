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
  OvertimeRequest,
  OvertimeRequestAddSchema,
  OvertimeRequestType,
  OvertimeRequestUpdateSchema,
} from 'src/app/shared/interfaces/requests/overtime';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { faEye, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LocalUserService } from 'src/app/shared/services/local-user.service';
import { User } from 'src/app/shared/interfaces/user';
import { OvertimeRequestService } from 'src/app/shared/services/requests/overtime.service';
import { takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Project } from 'src/app/shared/interfaces/project';
import { ProjectsService } from 'src/app/shared/services/projects.service';

@Component({
  selector: 'app-new-overtime-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './new-overtime-request.component.html',
  styleUrls: ['./new-overtime-request.component.scss'],
})
export class NewOvertimeRequestComponent
  extends DestroyBaseComponent
  implements OnInit
{
  @Output() onSave = new EventEmitter<OvertimeRequest>();
  faEdit = faPenToSquare;
  faView = faEye;

  overtimeRequest: OvertimeRequest = {
    overtimeID: '',
    u_EmployeeID: '',
    overtimeType: '',
    fromDate: '',
    toDate: '',
    statusTypeId: '',
    fromTime: null,
    toTime: null,
    status: '',
    overtimeCode: '',
    u_Status: null,
    u_ApprStatus1: null,
    u_ApprStatus2: null,
    u_ApprStatus3: null,
    ovHours: '',
    hour: 0,
    minute: 0,
    remarks: '',
    projectCode: '',
    projectName: '',
    sortFromDate: '',
    sortToDate: '',
    u_AttachFile: null,
  };

  isLoading = false;
  user: User;

  overtimeTypes: OvertimeRequestType[] = [];
  projects: Project[] = [];
  form: FormGroup;

  constructor(
    private userService: LocalUserService,
    private overtimeRequestService: OvertimeRequestService,
    private projectsService: ProjectsService,
    private fb: FormBuilder
  ) {
    super();
    this.user = this.userService.getUser();
    this.form = this.fb.group({
      overtimeType: [''],
      date: [''],
      hours: [''],
      minutes: [''],
      project: [''],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.setInputsDefaultValues();
    this.overtimeRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.overtimeTypes = value;
      });
    this.projectsService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.projects = value;
      });
  }

  private setInputsDefaultValues() {
    const today = new Date().toISOString().slice(0, 10);
    this.form.get('overtimeType')?.setValue('');
    this.form.get('date')?.setValue(today);
    this.form.get('hours')?.setValue(0);
    this.form.get('minutes')?.setValue(0);
    this.form.get('project')?.setValue('');
    this.form.get('remarks')?.setValue('');
  }

  onSubmit() {
    this.isLoading = true;
    const formValues = this.form.value;
    const data: OvertimeRequestAddSchema = {
      u_EmployeeID: '',
      u_OvType: formValues.overtimeType ?? undefined,
      u_FromDate: formValues.date ?? undefined,
      u_ToDate: formValues.date ?? undefined,
      u_OvHour: formValues.hours?.toString() ?? undefined,
      u_OvMin: formValues.minutes?.toString() ?? undefined,
      u_ProjectCode: formValues.project ?? undefined, // todo
      u_Remarks: formValues.remarks ?? undefined,
    };
    this.overtimeRequestService
      .add(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // this.updateOvertimeRequestModel();
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
