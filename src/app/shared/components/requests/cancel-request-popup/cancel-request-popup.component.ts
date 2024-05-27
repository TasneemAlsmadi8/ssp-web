import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericRequestService } from '../../../services/requests/generic-request.service';
import Swal from 'sweetalert2';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from '../../../base/destroy-base.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cancel-request-popup',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <button
      class="font-medium text-red-600 hover:underline"
      (click)="cancelLeaveRequest()"
      title="Cancel"
    >
      <fa-icon [icon]="faCancel"></fa-icon>
    </button>
  `,
  styleUrls: ['./cancel-request-popup.component.scss'],
})
export class CancelRequestPopupComponent extends DestroyBaseComponent {
  @Input({ required: true }) service!: GenericRequestService<
    any,
    any,
    any,
    any
  >;
  @Input({ required: true }) id!: string;

  faCancel = faBan;

  cancelLeaveRequest() {
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

        this.service
          .cancel(this.id)
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
}
