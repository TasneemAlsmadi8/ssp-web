import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OvertimeRequest,
  OvertimeRequestType,
  OvertimeRequestUpdateSchema,
} from 'src/app/shared/interfaces/requests/overtime';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { OvertimeRequestService } from 'src/app/shared/services/requests/overtime.service';
import { takeUntil } from 'rxjs';
import { Project } from 'src/app/shared/interfaces/project';
import { ProjectsService } from 'src/app/shared/services/projects.service';
import { formatDateToISO } from 'src/app/shared/utils/data-formatter';
import {
  FormValues,
  RequestDetailsComponentTemplate,
} from 'src/app/shared/components/requests/request-details-template.component';
import { limitNumberInput } from 'src/app/shared/utils/form-utils';

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
      overtimeType: ['', [Validators.required]],
      date: ['', [Validators.required]],
      hours: ['', [Validators.required, Validators.min(0)]],
      minutes: [
        '',
        [Validators.required, Validators.min(0), Validators.max(59)],
      ],
      project: ['', [Validators.required]],
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
  override mapItemFieldsToFormValues(
    item: OvertimeRequest
  ): FormValues<typeof this.formControls> {
    return {
      overtimeType: item.overtimeCode,
      date: formatDateToISO(item.fromDate),
      hours: item.hour,
      minutes: item.minute,
      project: item.projectCode,
      remarks: item.remarks,
    };
  }
  override resetInvalidInputs(): void {
    const hours = this.form.get('hours');
    const minutes = this.form.get('minutes');
    if (!hours || !minutes) throw new Error('Invalid form Control');

    limitNumberInput(hours);
    limitNumberInput(minutes);
  }
}
