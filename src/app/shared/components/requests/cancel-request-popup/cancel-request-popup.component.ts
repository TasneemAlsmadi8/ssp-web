import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericRequestService } from '../../../services/requests/generic-request.service';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from '../../../base/destroy-base.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { UserAlertService } from 'src/app/shared/services/user-alert.service';

@Component({
  selector: 'app-cancel-request-popup',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <button
      class="font-medium text-red-600 hover:bg-blue-100 w-6 h-7 rounded"
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

  constructor(private userAlertService: UserAlertService) {
    super();
  }

  cancelLeaveRequest() {
    this.userAlertService
      .confirmAction(
        'Are you sure?',
        "You won't be able to revert this!",
        'Yes, cancel it!',
        'No'
      )
      .subscribe((isConfirmed) => {
        if (isConfirmed) {
          this.userAlertService.showLoading(
            'Canceling...',
            'Please wait while we cancel your request.'
          );

          this.service
            .cancel(this.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (value) => {
                this.userAlertService.showSuccess(
                  'Canceled!',
                  'Your Request has been canceled.'
                );
              },
              error: (err) => {
                console.log(err);
                this.userAlertService.showError(
                  'Error!',
                  'There was an error canceling your request.'
                );
              },
            });
        }
      });
  }
}
