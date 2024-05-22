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
import { ArrayPaginator } from 'src/app/shared/utils/array-paginator';
import { NewLoanRequestComponent } from './new-loan-request/new-loan-request.component';

@Component({
  selector: 'app-requests-loans',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LoanRequestDetailsComponent,
    NewLoanRequestComponent,
  ],
  templateUrl: './requests-loans.component.html',
  styleUrls: ['./requests-loans.component.scss'],
})
export class RequestsLoansComponent
  extends DestroyBaseComponent
  implements OnInit
{
  get loanRequests(): LoanRequest[] {
    return this.paginator.page;
  }
  faCancel = faBan;

  paginator = new ArrayPaginator([]);

  constructor(private loanService: LoanRequestService) {
    super();
    loanService.loanRequests$.subscribe((value) => {
      this.paginator.updateItems(value);
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

  cancelLoanRequest(req: LoanRequest) {
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
          willOpen: () => {
            Swal.showLoading();
          },
        });

        this.loanService
          .cancel(req.loanID)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (value) => {
              // req.status = 'Canceled';
              // req.statusTypeId = req.u_Status =
              //   LoanRequestStatus.Canceled.toString();
              // console.log(value);

              Swal.fire({
                title: 'Canceled!',
                text: 'Your Loan Request has been canceled.',
                icon: 'success',
              });
            },
            error: (err) => {
              console.log(err);
              Swal.fire({
                title: 'Error!',
                text: 'There was an error canceling your loan request.',
                icon: 'error',
              });
            },
          });
      }
    });
  }

  trackByRequestId(index: number, item: LoanRequest): number {
    return parseInt(item.loanID);
  }
}
