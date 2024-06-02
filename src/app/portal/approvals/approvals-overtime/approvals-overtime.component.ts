import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { ApprovalPageComponentTemplate } from 'src/app/shared/components/approvals/approvals-page-template.component';
import { OvertimeApproval } from 'src/app/shared/interfaces/approvals/overtime';
import { ApprovalRejectButtonComponent } from 'src/app/shared/components/approvals/approval-reject-button/approval-reject-button.component';
import { ApprovalAcceptButtonComponent } from 'src/app/shared/components/approvals/approval-accept-button/approval-accept-button.component';
import {
  OvertimeRequest,
  OvertimeRequestStatus,
} from 'src/app/shared/interfaces/requests/overtime';
import { ApprovalSpeedDialComponent } from 'src/app/shared/components/approvals/approval-speed-dial/approval-speed-dial.component';
import { OvertimeRequestDetailsComponent } from '../../requests/requests-overtime/overtime-request-details/overtime-request-details.component';
import { OvertimeApprovalService } from 'src/app/shared/services/approvals/overtime.service';

@Component({
  selector: 'app-approvals-overtime',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    OvertimeRequestDetailsComponent,
    RequestDetailsButtonComponent,
    PaginatedTableComponent,
    ApprovalRejectButtonComponent,
    ApprovalAcceptButtonComponent,
    ApprovalSpeedDialComponent,
  ],
  templateUrl: './approvals-overtime.component.html',
  styleUrls: ['./approvals-overtime.component.scss'],
})
export class ApprovalsOvertimeComponent extends ApprovalPageComponentTemplate<
  OvertimeApproval,
  OvertimeRequest
> {
  constructor(protected overtimeService: OvertimeApprovalService) {
    super(overtimeService);
  }

  override getItemId(item: OvertimeApproval): number {
    return parseInt(item.overtimeID);
  }
  override mapApprovalToUpdateRequest(item: OvertimeApproval): OvertimeRequest {
    const data: OvertimeRequest = {
      overtimeID: item.overtimeID,
      overtimeType: item.overtimeType,
      fromDate: item.fromDate,
      remarks: item.remarks,
      u_EmployeeID: item.empID,
      statusTypeId: OvertimeRequestStatus.Pending,
      status: 'Pending',
      overtimeCode: item.overtimeCode,
      u_Status: OvertimeRequestStatus.Pending,
      ovHours: (
        parseFloat(item.ovHour) +
        parseFloat(item.ovMin) / 60
      ).toString(),
      hour: parseFloat(item.ovHour),
      minute: parseFloat(item.ovMin),
      projectCode: item.projectCode,
      projectName: item.projectName,

      u_ApprStatus1: '',
      u_ApprStatus2: null,
      u_ApprStatus3: null,
      u_AttachFile: '',

      sortFromDate: '',
      sortToDate: '',

      toDate: '',
      fromTime: null,
      toTime: null,
    };
    return data;
  }
}
