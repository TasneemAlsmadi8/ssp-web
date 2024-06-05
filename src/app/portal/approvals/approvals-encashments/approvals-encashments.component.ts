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
import { EncashmentRequest } from 'src/app/shared/interfaces/requests/encashment';
import { ApprovalSpeedDialComponent } from 'src/app/shared/components/approvals/approval-speed-dial/approval-speed-dial.component';
import { TranslateModule } from '@ngx-translate/core';

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
    TranslateModule,
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
    return parseInt(item.id);
  }
  override mapApprovalToUpdateRequest(
    item: EncashmentApproval
  ): EncashmentRequest {
    // TODO: Check
    const data: EncashmentRequest = {
      id: item.id,
      remarks: item.remarks,
      status: 'Pending',
      encashName: item.encashName,
      value: item.value,
      date: item.date,
      encashCode: item.encashCode,
      createDate: item.dateSubmitted,
      projectCode: item.projectCode,
      unitCount: item.unitCount,
      unitPrice: 0,
      loanId: null,
    };
    return data;
  }
}
