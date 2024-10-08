import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { LoanRequestDetailsComponent } from '../../requests/requests-loans/loan-request-details/loan-request-details.component';
import { ApprovalPageComponentTemplate } from 'src/app/shared/components/approvals/approvals-page-template.component';
import { LoanApprovalService } from 'src/app/shared/services/approvals/loan.service';
import { LoanApproval } from 'src/app/shared/interfaces/approvals/loan';
import { ApprovalRejectButtonComponent } from 'src/app/shared/components/approvals/approval-reject-button/approval-reject-button.component';
import { ApprovalAcceptButtonComponent } from 'src/app/shared/components/approvals/approval-accept-button/approval-accept-button.component';
import { LoanRequest } from 'src/app/shared/interfaces/requests/loan';
import { ApprovalSpeedDialComponent } from 'src/app/shared/components/approvals/approval-speed-dial/approval-speed-dial.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-approvals-loans',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LoanRequestDetailsComponent,
    RequestDetailsButtonComponent,
    PaginatedTableComponent,
    ApprovalRejectButtonComponent,
    ApprovalAcceptButtonComponent,
    ApprovalSpeedDialComponent,
    TranslateModule,
  ],
  templateUrl: './approvals-loans.component.html',
  styleUrls: ['./approvals-loans.component.scss'],
})
export class ApprovalsLoansComponent extends ApprovalPageComponentTemplate<
  LoanApproval,
  LoanRequest
> {
  constructor(protected loanService: LoanApprovalService) {
    super(loanService);
  }

  override getItemId(item: LoanApproval): number {
    return parseInt(item.id);
  }
  override mapApprovalToUpdateRequest(item: LoanApproval): LoanRequest {
    // TODO: Check
    const data: LoanRequest = {
      id: item.id,
      remarks: item.remarks,
      status: 'Pending',
      loanCode: item.loanCode,
      dateSubmitted: item.dateSubmitted,
      loanName: item.loanName,
      totalAmount: item.totalAmount,
      installmentCount: item.installmentCount,
      startDate: item.startDate,

      employeeId: item.employeeId,
      employeeCode: item.employeeCode,
      fullName: item.fullName,
      fullNameF: item.fullNameF,
    };
    return data;
  }
}
