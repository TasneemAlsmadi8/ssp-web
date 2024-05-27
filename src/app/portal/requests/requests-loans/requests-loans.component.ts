import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LoanRequestService } from 'src/app/shared/services/requests/loan.service';
import { LoanRequest } from 'src/app/shared/interfaces/requests/loan';
import { takeUntil } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { LoanRequestDetailsComponent } from './loan-request-details/loan-request-details.component';
import Swal from 'sweetalert2';
import { NewLoanRequestComponent } from './new-loan-request/new-loan-request.component';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { CancelRequestPopupComponent } from 'src/app/shared/components/requests/cancel-request-popup/cancel-request-popup.component';

@Component({
  selector: 'app-requests-loans',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LoanRequestDetailsComponent,
    NewLoanRequestComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
  ],
  templateUrl: './requests-loans.component.html',
  styleUrls: ['./requests-loans.component.scss'],
})
export class RequestsLoansComponent
  extends DestroyBaseComponent
  implements OnInit
{
  loanRequests: LoanRequest[] = [];
  activePageItems: LoanRequest[] = [];

  constructor(protected loanService: LoanRequestService) {
    super();
    loanService.items$.subscribe((value) => {
      this.loanRequests = value;
    });
  }

  ngOnInit(): void {
    this.loanService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          // this.loanRequests = value;
          // console.log(value);
          // this.setInputsDefaultValues();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  trackByRequestId(index: number, item: LoanRequest): number {
    return parseInt(item.loanID);
  }
}
