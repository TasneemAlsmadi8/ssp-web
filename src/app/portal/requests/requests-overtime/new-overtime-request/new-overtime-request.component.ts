import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OvertimeRequest,
  OvertimeRequestAddSchema,
  OvertimeRequestType,
} from 'src/app/shared/interfaces/requests/overtime';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { OvertimeRequestService } from 'src/app/shared/services/requests/overtime.service';
import { takeUntil } from 'rxjs';
import { Project } from 'src/app/shared/interfaces/project';
import { ProjectsService } from 'src/app/shared/services/projects.service';
import { NewRequestModalComponent } from 'src/app/shared/components/requests/new-request-modal/new-request-modal.component';
import { NewRequestComponentTemplate } from 'src/app/shared/components/requests/new-request-template.component';

@Component({
  selector: 'app-new-overtime-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    NewRequestModalComponent,
  ],
  templateUrl: './new-overtime-request.component.html',
  styleUrls: ['./new-overtime-request.component.scss'],
})
export class NewOvertimeRequestComponent
  extends NewRequestComponentTemplate<OvertimeRequest, OvertimeRequestAddSchema>
  implements OnInit
{
  @Output() onSave = new EventEmitter<OvertimeRequest>();

  item: OvertimeRequest = {
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

  overtimeTypes: OvertimeRequestType[] = [];
  projects: Project[] = [];

  constructor(
    private overtimeRequestService: OvertimeRequestService,
    private projectsService: ProjectsService
  ) {
    const today = new Date().toISOString().slice(0, 10);
    super(overtimeRequestService, {
      overtimeType: [''],
      date: [today],
      hours: [0],
      minutes: [0],
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

  override mapFormToAddRequest(formValues: any): OvertimeRequestAddSchema {
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
    return data;
  }
}
