import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { ValueTransactionRequestService } from 'src/app/shared/services/requests/value-transaction.service';
import { ValueTransactionRequest } from 'src/app/shared/interfaces/requests/value-transaction';
import { takeUntil } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { ValueTransactionRequestDetailsComponent } from './value-transaction-request-details/value-transaction-request-details.component';
import Swal from 'sweetalert2';
import { ArrayPaginator } from 'src/app/shared/utils/array-paginator';
import { NewValueTransactionRequestComponent } from './new-value-transaction-request/new-value-transaction-request.component';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { CancelRequestPopupComponent } from 'src/app/shared/components/requests/cancel-request-popup/cancel-request-popup.component';

@Component({
  selector: 'app-requests-value-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ValueTransactionRequestDetailsComponent,
    NewValueTransactionRequestComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
  ],
  templateUrl: './requests-value-transactions.component.html',
  styleUrls: ['./requests-value-transactions.component.scss'],
})
export class RequestsValueTransactionsComponent
  extends DestroyBaseComponent
  implements OnInit
{
  valueTransactionRequests: ValueTransactionRequest[] = [];
  activePageItems: ValueTransactionRequest[] = [];

  constructor(
    protected valueTransactionService: ValueTransactionRequestService
  ) {
    super();
    valueTransactionService.items$.subscribe((value) => {
      this.valueTransactionRequests = value;
    });
  }

  ngOnInit(): void {
    this.valueTransactionService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          // this.valueTransactionRequests = value;
          // console.log(value);
          // this.setInputsDefaultValues();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  trackByRequestId(index: number, item: ValueTransactionRequest): number {
    return parseInt(item.valueTranID);
  }
}
