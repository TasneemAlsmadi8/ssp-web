import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanRequestService } from 'src/app/shared/services/requests/loan.service';
import { LoanRequest } from 'src/app/shared/interfaces/requests/loan';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoanRequestDetailsComponent } from './loan-request-details/loan-request-details.component';
import { NewLoanRequestComponent } from './new-loan-request/new-loan-request.component';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { CancelRequestPopupComponent } from 'src/app/shared/components/requests/cancel-request-popup/cancel-request-popup.component';
import { RequestPageComponentTemplate } from 'src/app/shared/components/requests/request-page-template.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-requests-loans',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LoanRequestDetailsComponent,
    RequestDetailsButtonComponent,
    NewLoanRequestComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
    TranslateModule,
  ],
  templateUrl: './requests-loans.component.html',
  styleUrls: ['./requests-loans.component.scss'],
})
export class RequestsLoansComponent extends RequestPageComponentTemplate<LoanRequest> {
  constructor(protected loanService: LoanRequestService) {
    super(loanService);
  }

  override trackByRequestId(index: number, item: LoanRequest): number {
    return parseInt(item.id);
  }
}
