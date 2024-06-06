import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { LoanRequestDetailsComponent } from '../../requests/requests-loans/loan-request-details/loan-request-details.component';
import { HistoryPageComponentTemplate } from 'src/app/shared/components/history/history-page-template.component';
import { LoanHistoryService } from 'src/app/shared/services/history/loan.service';
import { LoanHistory } from 'src/app/shared/interfaces/history/loan';
import { LoanRequest } from 'src/app/shared/interfaces/requests/loan';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-history-loans',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LoanRequestDetailsComponent,
    RequestDetailsButtonComponent,
    PaginatedTableComponent,
    TranslateModule,
  ],
  templateUrl: './history-loans.component.html',
  styleUrls: ['./history-loans.component.scss'],
})
export class HistoryLoansComponent extends HistoryPageComponentTemplate<
  LoanHistory,
  LoanRequest
> {
  constructor(protected loanService: LoanHistoryService) {
    super(loanService);
  }

  override getItemId(item: LoanHistory): number {
    return parseInt(item.id);
  }
  override mapHistoryToUpdateRequest(item: LoanHistory): LoanRequest {
    const data: LoanRequest = {
      id: item.id,
      dateSubmitted: item.dateSubmitted,
      loanCode: item.loanCode,
      loanName: item.loanName,
      totalAmount: item.totalAmount,
      installmentCount: item.installmentCount,
      startDate: item.startDate,
      status: item.status,

      employeeId: item.employeeId,
      employeeCode: item.employeeCode,
      fullName: item.fullName,
      fullNameF: item.fullNameF,
    };
    return data;
  }
}
