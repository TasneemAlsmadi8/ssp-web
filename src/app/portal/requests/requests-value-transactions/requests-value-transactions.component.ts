import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValueTransactionRequestService } from 'src/app/shared/services/requests/value-transaction.service';
import { ValueTransactionRequest } from 'src/app/shared/interfaces/requests/value-transaction';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ValueTransactionRequestDetailsComponent } from './value-transaction-request-details/value-transaction-request-details.component';
import { NewValueTransactionRequestComponent } from './new-value-transaction-request/new-value-transaction-request.component';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { CancelRequestPopupComponent } from 'src/app/shared/components/requests/cancel-request-popup/cancel-request-popup.component';
import { RequestPageComponentTemplate } from 'src/app/shared/components/requests/request-page-template.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-requests-value-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ValueTransactionRequestDetailsComponent,
    RequestDetailsButtonComponent,
    NewValueTransactionRequestComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
    TranslateModule,
  ],
  templateUrl: './requests-value-transactions.component.html',
  styleUrls: ['./requests-value-transactions.component.scss'],
})
export class RequestsValueTransactionsComponent extends RequestPageComponentTemplate<ValueTransactionRequest> {
  constructor(
    protected valueTransactionService: ValueTransactionRequestService
  ) {
    super(valueTransactionService);
  }

  override trackByRequestId(
    index: number,
    item: ValueTransactionRequest
  ): number {
    return parseInt(item.id);
  }
}
