import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { LeaveRequest } from 'src/app/shared/interfaces/requests/leave';
import { takeUntil } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { LeaveRequestDetailsComponent } from './leave-request-details/leave-request-details.component';
import Swal from 'sweetalert2';
import { ArrayPaginator } from 'src/app/shared/utils/array-paginator';
import { NewLeaveRequestComponent } from './new-leave-request/new-leave-request.component';

@Component({
  selector: 'app-requests-leaves',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LeaveRequestDetailsComponent,
    NewLeaveRequestComponent,
  ],
  templateUrl: './requests-leaves.component.html',
  styleUrls: ['./requests-leaves.component.scss'],
})
export class RequestsLeavesComponent
  extends DestroyBaseComponent
  implements OnInit
{
  get leaveRequests(): LeaveRequest[] {
    return this.paginator.page;
  }
  faCancel = faBan;

  paginator = new ArrayPaginator([]);

  constructor(private leaveService: LeaveRequestService) {
    super();
    leaveService.leaveRequests$.subscribe((value) => {
      this.paginator.updateItems(value);
    });
  }

  ngOnInit(): void {
    this.leaveService
      .getLeaveRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          // this.leaveRequests = value;
          // console.log(value);
          // this.setInputsDefaultValues();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  cancelLeaveRequest(req: LeaveRequest) {
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

        this.leaveService
          .cancelLeaveRequest(req.leaveID)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (value) => {
              // req.status = 'Canceled';
              // req.statusTypeId = req.u_Status =
              //   LeaveRequestStatus.Canceled.toString();
              // console.log(value);

              Swal.fire({
                title: 'Canceled!',
                text: 'Your Leave Request has been canceled.',
                icon: 'success',
              });
            },
            error: (err) => {
              console.log(err);
              Swal.fire({
                title: 'Error!',
                text: 'There was an error canceling your leave request.',
                icon: 'error',
              });
            },
          });
      }
    });
  }

  trackByRequestId(index: number, item: LeaveRequest): number {
    return parseInt(item.leaveID);
  }
}
