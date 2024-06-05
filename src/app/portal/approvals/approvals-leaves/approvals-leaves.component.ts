import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { LeaveRequestDetailsComponent } from '../../requests/requests-leaves/leave-request-details/leave-request-details.component';
import { ApprovalPageComponentTemplate } from 'src/app/shared/components/approvals/approvals-page-template.component';
import { LeaveApprovalService } from 'src/app/shared/services/approvals/leave.service';
import { LeaveApproval } from 'src/app/shared/interfaces/approvals/leave';
import { ApprovalRejectButtonComponent } from 'src/app/shared/components/approvals/approval-reject-button/approval-reject-button.component';
import { ApprovalAcceptButtonComponent } from 'src/app/shared/components/approvals/approval-accept-button/approval-accept-button.component';
import {
  LeaveRequest,
  LeaveRequestStatus,
} from 'src/app/shared/interfaces/requests/leave';
import { ApprovalSpeedDialComponent } from 'src/app/shared/components/approvals/approval-speed-dial/approval-speed-dial.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-approvals-leaves',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LeaveRequestDetailsComponent,
    RequestDetailsButtonComponent,
    PaginatedTableComponent,
    ApprovalRejectButtonComponent,
    ApprovalAcceptButtonComponent,
    ApprovalSpeedDialComponent,
    TranslateModule,
  ],
  templateUrl: './approvals-leaves.component.html',
  styleUrls: ['./approvals-leaves.component.scss'],
})
export class ApprovalsLeavesComponent extends ApprovalPageComponentTemplate<
  LeaveApproval,
  LeaveRequest
> {
  activeItemEmployeeId?: string;
  constructor(protected leaveService: LeaveApprovalService) {
    super(leaveService);
  }

  override getItemId(item: LeaveApproval): number {
    return parseInt(item.id);
  }
  override mapApprovalToUpdateRequest(item: LeaveApproval): LeaveRequest {
    const data: LeaveRequest = {
      id: item.id,
      leaveType: item.leaveType,
      fromDate: item.fromDate,
      toDate: item.toDate,
      fromTime: item.fromTime,
      toTime: item.toTime,
      remarks: item.remarks,
      // statusTypeId: LeaveRequestStatus.Pending,
      status: 'Pending',
      leaveCode: item.leaveCode,
      paidDays: '',
      unpaidDays: '',
    };
    return data;
  }

  override setActiveItemDetails(activeItemDetails: LeaveApproval) {
    super.setActiveItemDetails(activeItemDetails);
    this.activeItemEmployeeId = activeItemDetails.employeeId;
  }
}
