import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { EncashmentRequestDetailsComponent } from '../../requests/requests-encashments/encashment-request-details/encashment-request-details.component';
import { ApprovalPageComponentTemplate } from 'src/app/shared/components/approvals/approvals-page-template.component';
import { EncashmentApprovalService } from 'src/app/shared/services/approvals/encashment.service';
import { EncashmentApproval } from 'src/app/shared/interfaces/approvals/encashment';
import { ApprovalRejectButtonComponent } from 'src/app/shared/components/approvals/approval-reject-button/approval-reject-button.component';
import { ApprovalAcceptButtonComponent } from 'src/app/shared/components/approvals/approval-accept-button/approval-accept-button.component';
import {
  EncashmentRequest,
  EncashmentRequestStatus,
} from 'src/app/shared/interfaces/requests/encashment';
import { ApprovalSpeedDialComponent } from 'src/app/shared/components/approvals/approval-speed-dial/approval-speed-dial.component';

@Component({
  selector: 'app-approvals-encashments',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    EncashmentRequestDetailsComponent,
    RequestDetailsButtonComponent,
    PaginatedTableComponent,
    ApprovalRejectButtonComponent,
    ApprovalAcceptButtonComponent,
    ApprovalSpeedDialComponent,
  ],
  templateUrl: './approvals-encashments.component.html',
  styleUrls: ['./approvals-encashments.component.scss'],
})
export class ApprovalsEncashmentsComponent extends ApprovalPageComponentTemplate<
  EncashmentApproval,
  EncashmentRequest
> {
  constructor(protected encashmentService: EncashmentApprovalService) {
    super(encashmentService);
  }

  override getItemId(item: EncashmentApproval): number {
    return parseInt(item.encashID);
  }
  override mapApprovalToUpdateRequest(
    item: EncashmentApproval
  ): EncashmentRequest {
    // TODO: Check
    const data: EncashmentRequest = {
      encashID: item.encashID,
      remarks: item.remarks,
      status: 'Pending',
      u_EmployeeID: item.empID,
      encashName: item.encashName,
      value: item.value,
      date: item.date,
      encashCode: item.encashCode,
      u_Status: EncashmentRequestStatus.Pending,
      createDate: item.dateSubmitted,
      projectCode: item.projectCode,
      unitCount: item.unitCount,

      u_ApprStatus1: null,
      u_ApprStatus2: null,
      u_ApprStatus3: null,

      unitPrice: '',
      loanID: null,
      installmentCount: null,
      sortDate: '',
      u_AttachFile: '',
    };
    return data;
  }
}
