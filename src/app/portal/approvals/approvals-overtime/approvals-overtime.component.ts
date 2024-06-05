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
import { TranslateModule } from '@ngx-translate/core';

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
    TranslateModule,
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
    return parseInt(item.id);
  }
  override mapApprovalToUpdateRequest(item: OvertimeApproval): OvertimeRequest {
    const data: OvertimeRequest = {
      id: item.id,
      overtimeType: item.overtimeType,
      fromDate: item.fromDate,
      remarks: item.remarks,
      status: 'Pending',
      overtimeCode: item.overtimeCode,
      overtimeHours: (
        parseFloat(item.hour) +
        parseFloat(item.minute) / 60
      ).toString(),
      hour: parseFloat(item.hour),
      minute: parseFloat(item.minute),
      projectCode: item.projectCode,
      projectName: item.projectName,

      toDate: '',
      fromTime: null,
      toTime: null,
    };
    return data;
  }
}
