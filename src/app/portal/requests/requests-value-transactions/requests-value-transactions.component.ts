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

@Component({
  selector: 'app-requests-value-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ValueTransactionRequestDetailsComponent,
    NewValueTransactionRequestComponent,
  ],
  templateUrl: './requests-value-transactions.component.html',
  styleUrls: ['./requests-value-transactions.component.scss'],
})
export class RequestsValueTransactionsComponent
  extends DestroyBaseComponent
  implements OnInit
{
  get valueTransactionRequests(): ValueTransactionRequest[] {
    return this.paginator.page;
  }
  faCancel = faBan;

  paginator = new ArrayPaginator([]);

  constructor(private valueTransactionService: ValueTransactionRequestService) {
    super();
    valueTransactionService.valueTransactionRequests$.subscribe((value) => {
      this.paginator.updateItems(value);
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

  cancelValueTransactionRequest(req: ValueTransactionRequest) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Canceling...',
          text: 'Please wait while we cancel your request.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        this.valueTransactionService
          .cancel(req.valueTranID)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (value) => {
              // req.status = 'Canceled';
              // req.statusTypeId = req.u_Status =
              //   ValueTransactionRequestStatus.Canceled.toString();
              // console.log(value);

              Swal.fire({
                title: 'Canceled!',
                text: 'Your Value Transaction Request has been canceled.',
                icon: 'success',
              });
            },
            error: (err) => {
              console.log(err);
              Swal.fire({
                title: 'Error!',
                text: 'There was an error canceling your valueTransaction request.',
                icon: 'error',
              });
            },
          });
      }
    });
  }

  trackByRequestId(index: number, item: ValueTransactionRequest): number {
    return parseInt(item.valueTranID);
  }
}
