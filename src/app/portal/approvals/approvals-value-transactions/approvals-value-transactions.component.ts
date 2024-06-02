import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { ValueTransactionRequestDetailsComponent } from '../../requests/requests-value-transactions/value-transaction-request-details/value-transaction-request-details.component';
import { ApprovalPageComponentTemplate } from 'src/app/shared/components/approvals/approvals-page-template.component';
import { ValueTransactionApprovalService } from 'src/app/shared/services/approvals/value-transaction.service';
import { ValueTransactionApproval } from 'src/app/shared/interfaces/approvals/value-transaction';
import { ApprovalRejectButtonComponent } from 'src/app/shared/components/approvals/approval-reject-button/approval-reject-button.component';
import { ApprovalAcceptButtonComponent } from 'src/app/shared/components/approvals/approval-accept-button/approval-accept-button.component';
import {
  ValueTransactionRequest,
  ValueTransactionRequestStatus,
} from 'src/app/shared/interfaces/requests/value-transaction';
import { ApprovalSpeedDialComponent } from 'src/app/shared/components/approvals/approval-speed-dial/approval-speed-dial.component';

@Component({
  selector: 'app-approvals-value-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ValueTransactionRequestDetailsComponent,
    RequestDetailsButtonComponent,
    PaginatedTableComponent,
    ApprovalRejectButtonComponent,
    ApprovalAcceptButtonComponent,
    ApprovalSpeedDialComponent,
  ],
  templateUrl: './approvals-value-transactions.component.html',
  styleUrls: ['./approvals-value-transactions.component.scss'],
})
export class ApprovalsValueTransactionsComponent extends ApprovalPageComponentTemplate<
  ValueTransactionApproval,
  ValueTransactionRequest
> {
  constructor(
    protected valueTransactionService: ValueTransactionApprovalService
  ) {
    super(valueTransactionService);
  }

  override getItemId(item: ValueTransactionApproval): number {
    return parseInt(item.valueTranID);
  }
  override mapApprovalToUpdateRequest(
    item: ValueTransactionApproval
  ): ValueTransactionRequest {
    // TODO: Check
    const data: ValueTransactionRequest = {
      valueTranID: item.valueTranID,
      remarks: item.remarks,
      status: 'Pending',
      valueTranCode: item.valueTranCode,
      u_EmployeeID: item.empID,
      valueTranName: item.valueTranName,
      value: item.value,
      date: item.date,
      u_Status: ValueTransactionRequestStatus.Pending,
      createDate: item.dateSubmitted,

      u_ApprStatus1: null,
      u_ApprStatus2: null,
      u_ApprStatus3: null,

      projectCode: item.projectCode,
      sortDate: '',
    };
    return data;
  }
}
