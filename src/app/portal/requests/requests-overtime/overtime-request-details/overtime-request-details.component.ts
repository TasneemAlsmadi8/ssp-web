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
import { RequestDetailsModalComponent } from 'src/app/shared/components/requests/request-details-modal/request-details-modal.component';
import { FormValues, RequestDetailsComponentTemplate } from 'src/app/shared/components/requests/request-details-template.component';

@Component({
  selector: 'app-overtime-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    RequestDetailsModalComponent,
  ],
  templateUrl: './overtime-request-details.component.html',
  styleUrls: ['./overtime-request-details.component.scss'],
})
export class OvertimeRequestDetailsComponent extends RequestDetailsComponentTemplate<
  OvertimeRequest,
  OvertimeRequestUpdateSchema
> {
  overtimeTypes: OvertimeRequestType[] = [];
  projects: Project[] = [];

  constructor(
    private overtimeRequestService: OvertimeRequestService,
    private projectsService: ProjectsService
  ) {
    super(overtimeRequestService, {
      overtimeType: [''],
      date: [''],
      hours: [''],
      minutes: [''],
      project: [''],
      remarks: [''],
    });
  }

  override getDynamicValues(): void {
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
  override mapFormToUpdateRequest(
    formValues: any
  ): OvertimeRequestUpdateSchema {
    const data: OvertimeRequestUpdateSchema = {
      docEntry: this.item.overtimeID,
      u_OvType: formValues.overtimeType ?? undefined,
      u_FromDate: formValues.date ?? undefined,
      u_ToDate: formValues.date ?? undefined,
      u_OvHour: formValues.hours?.toString() ?? undefined,
      u_OvMin: formValues.minutes?.toString() ?? undefined,
      u_ProjectCode: formValues.project ?? undefined, // todo
      u_Remarks: formValues.remarks ?? undefined,
    };
    return data;
  }
  override mapItemFieldsToFormValues(item: OvertimeRequest): FormValues {
    return {
      overtimeType: item.overtimeCode,
      date: formatDateToISO(item.fromDate),
      hours: item.hour,
      minutes: item.minute,
      project: item.projectCode,
      remarks: item.remarks,
    };
  }

  // private setInputsDefaultValues() {
  //   this.form.get('overtimeType')?.setValue(this.item.overtimeCode);
  //   this.form.get('date')?.setValue(formatDateToISO(this.item.fromDate));
  //   this.form.get('hours')?.setValue(this.item.hour);
  //   this.form.get('minutes')?.setValue(this.item.minute);
  //   this.form.get('project')?.setValue(this.item.projectCode);
  //   this.form.get('remarks')?.setValue(this.item.remarks);
  // }

  // private updateOvertimeRequestModel() {
  //   const formValues = this.form.value;
  //   this.overtimeRequest = {
  //     ...this.overtimeRequest,
  //     overtimeCode: formValues.overtimeType ?? this.overtimeRequest.overtimeCode,
  //     remarks: formValues.toDate ?? this.overtimeRequest.remarks,
  //   };
  // }

  // onSubmit() {
  //   this.isLoading = true;
  //   const formValues = this.form.value;
  //   const data: OvertimeRequestUpdateSchema = {
  //     docEntry: this.item.overtimeID,
  //     u_OvType: formValues.overtimeType ?? undefined,
  //     u_FromDate: formValues.date ?? undefined,
  //     u_ToDate: formValues.date ?? undefined,
  //     u_OvHour: formValues.hours?.toString() ?? undefined,
  //     u_OvMin: formValues.minutes?.toString() ?? undefined,
  //     u_ProjectCode: formValues.project ?? undefined, // todo
  //     u_Remarks: formValues.remarks ?? undefined,
  //   };
  //   this.overtimeRequestService
  //     .update(data)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (res) => {
  //         // this.updateOvertimeRequestModel();
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
  /** change format from "dd/mm/yyyy" to standard "yyyy-mm-dd" */
  // private formatDate(dateString: string): string {
  //   const [day, month, year] = dateString.split('/');
  //   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  // }
}
