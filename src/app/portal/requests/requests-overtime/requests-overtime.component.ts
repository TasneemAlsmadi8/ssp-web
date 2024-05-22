import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { OvertimeRequestService } from 'src/app/shared/services/requests/overtime.service';
import { OvertimeRequest } from 'src/app/shared/interfaces/requests/overtime';
import { takeUntil } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { OvertimeRequestDetailsComponent } from './overtime-request-details/overtime-request-details.component';
import Swal from 'sweetalert2';
import { ArrayPaginator } from 'src/app/shared/utils/array-paginator';
import { NewOvertimeRequestComponent } from './new-overtime-request/new-overtime-request.component';

@Component({
  selector: 'app-requests-overtime',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    OvertimeRequestDetailsComponent,
    NewOvertimeRequestComponent,
  ],
  templateUrl: './requests-overtime.component.html',
  styleUrls: ['./requests-overtime.component.scss'],
})
export class RequestsOvertimeComponent
  extends DestroyBaseComponent
  implements OnInit
{
  get overtimeRequests(): OvertimeRequest[] {
    return this.paginator.page;
  }
  faCancel = faBan;

  paginator = new ArrayPaginator([]);

  constructor(private overtimeService: OvertimeRequestService) {
    super();
    overtimeService.overtimeRequests$.subscribe((value) => {
      this.paginator.updateItems(value);
    });
  }

  ngOnInit(): void {
    this.overtimeService
      .getOvertimeRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          // this.overtimeRequests = value;
          console.log(value);
          // this.setInputsDefaultValues();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  cancelOvertimeRequest(req: OvertimeRequest) {
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

        this.overtimeService
          .cancelOvertimeRequest(req.overtimeID)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (value) => {
              // req.status = 'Canceled';
              // req.statusTypeId = req.u_Status =
              //   OvertimeRequestStatus.Canceled.toString();
              // console.log(value);

              Swal.fire({
                title: 'Canceled!',
                text: 'Your Overtime Request has been canceled.',
                icon: 'success',
              });
            },
            error: (err) => {
              console.log(err);
              Swal.fire({
                title: 'Error!',
                text: 'There was an error canceling your overtime request.',
                icon: 'error',
              });
            },
          });
      }
    });
  }

  trackByRequestId(index: number, item: OvertimeRequest): number {
    return parseInt(item.overtimeID);
  }
}
