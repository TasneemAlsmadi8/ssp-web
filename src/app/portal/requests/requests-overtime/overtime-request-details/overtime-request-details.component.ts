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
import { formatDateToISO } from 'src/app/shared/utils/data-formatter';

@Component({
  selector: 'app-overtime-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './overtime-request-details.component.html',
  styleUrls: ['./overtime-request-details.component.scss'],
})
export class OvertimeRequestDetailsComponent
  extends DestroyBaseComponent
  implements OnInit, OnChanges
{
  @Input() isEditable: boolean = true;
  @Input({ required: true }) overtimeRequest!: OvertimeRequest;
  @Output() overtimeRequestChange = new EventEmitter<OvertimeRequest>();
  faEdit = faPenToSquare;
  faView = faEye;

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
    this.setFormState();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditable']) {
      this.setFormState();
    }
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

  private setFormState() {
    if (this.isEditable) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  private setInputsDefaultValues() {
    this.form.get('overtimeType')?.setValue(this.overtimeRequest.overtimeCode);
    this.form
      .get('date')
      ?.setValue(formatDateToISO(this.overtimeRequest.fromDate));
    this.form.get('hours')?.setValue(this.overtimeRequest.hour);
    this.form.get('minutes')?.setValue(this.overtimeRequest.minute);
    this.form.get('project')?.setValue(this.overtimeRequest.projectCode);
    this.form.get('remarks')?.setValue(this.overtimeRequest.remarks);
  }

  // private updateOvertimeRequestModel() {
  //   const formValues = this.form.value;
  //   this.overtimeRequest = {
  //     ...this.overtimeRequest,
  //     overtimeCode: formValues.overtimeType ?? this.overtimeRequest.overtimeCode,
  //     remarks: formValues.toDate ?? this.overtimeRequest.remarks,
  //   };
  // }

  onSubmit() {
    this.isLoading = true;
    const formValues = this.form.value;
    const data: OvertimeRequestUpdateSchema = {
      docEntry: this.overtimeRequest.overtimeID,
      u_OvType: formValues.overtimeType ?? undefined,
      u_FromDate: formValues.date ?? undefined,
      u_ToDate: formValues.date ?? undefined,
      u_OvHour: formValues.hours?.toString() ?? undefined,
      u_OvMin: formValues.minutes?.toString() ?? undefined,
      u_ProjectCode: formValues.project ?? undefined, // todo
      u_Remarks: formValues.remarks ?? undefined,
    };
    this.overtimeRequestService
      .update(data)
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
