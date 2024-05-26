import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { EncashmentRequestService } from 'src/app/shared/services/requests/encashment.service';
import { EncashmentRequest } from 'src/app/shared/interfaces/requests/encashment';
import { takeUntil } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { EncashmentRequestDetailsComponent } from './encashment-request-details/encashment-request-details.component';
import Swal from 'sweetalert2';
import { NewEncashmentRequestComponent } from './new-encashment-request/new-encashment-request.component';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';

@Component({
  selector: 'app-requests-encashments',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    EncashmentRequestDetailsComponent,
    NewEncashmentRequestComponent,
    PaginatedTableComponent,
  ],
  templateUrl: './requests-encashments.component.html',
  styleUrls: ['./requests-encashments.component.scss'],
})
export class RequestsEncashmentsComponent
  extends DestroyBaseComponent
  implements OnInit
{
  encashmentRequests: EncashmentRequest[] = [];
  activePageItems: EncashmentRequest[] = [];
  faCancel = faBan;

  constructor(private encashmentService: EncashmentRequestService) {
    super();
    encashmentService.encashmentRequests$.subscribe((value) => {
      this.encashmentRequests = value;
    });
  }

  ngOnInit(): void {
    this.encashmentService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          // this.encashmentRequests = value;
          console.log(value);
          // this.setInputsDefaultValues();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  cancelEncashmentRequest(req: EncashmentRequest) {
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

        this.encashmentService
          .cancel(req.encashID)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (value) => {
              // req.status = 'Canceled';
              // req.statusTypeId = req.u_Status =
              //   EncashmentRequestStatus.Canceled.toString();
              // console.log(value);

              Swal.fire({
                title: 'Canceled!',
                text: 'Your Encashment Request has been canceled.',
                icon: 'success',
              });
            },
            error: (err) => {
              console.log(err);
              Swal.fire({
                title: 'Error!',
                text: 'There was an error canceling your encashment request.',
                icon: 'error',
              });
            },
          });
      }
    });
  }

  trackByRequestId(index: number, item: EncashmentRequest): number {
    return parseInt(item.encashID);
  }
}
