import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { CancelRequestPopupComponent } from 'src/app/shared/components/requests/cancel-request-popup/cancel-request-popup.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { LeaveRequestDetailsComponent } from '../../requests/requests-leaves/leave-request-details/leave-request-details.component';
import { ApprovalPageComponentTemplate } from 'src/app/shared/components/approvals/approvals-page-template.component';
import { LeaveApprovalService } from 'src/app/shared/services/approvals/leave.service';
import { LeaveApproval } from 'src/app/shared/interfaces/approvals/leave';

@Component({
  selector: 'app-approvals-leaves',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LeaveRequestDetailsComponent,
    RequestDetailsButtonComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
  ],
  templateUrl: './approvals-leaves.component.html',
  styleUrls: ['./approvals-leaves.component.scss'],
})
export class ApprovalsLeavesComponent extends ApprovalPageComponentTemplate<LeaveApproval> {
  constructor(protected leaveService: LeaveApprovalService) {
    super(leaveService);
  }

  override getItemId(item: LeaveApproval): number {
    return parseInt(item.leaveID);
  }
}
