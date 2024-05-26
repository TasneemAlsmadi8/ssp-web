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
import { NewLeaveRequestComponent } from './new-leave-request/new-leave-request.component';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { CancelRequestPopupComponent } from 'src/app/shared/components/cancel-request-popup/cancel-request-popup.component';

@Component({
  selector: 'app-requests-leaves',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LeaveRequestDetailsComponent,
    NewLeaveRequestComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
  ],
  templateUrl: './requests-leaves.component.html',
  styleUrls: ['./requests-leaves.component.scss'],
})
export class RequestsLeavesComponent
  extends DestroyBaseComponent
  implements OnInit
{
  leaveRequests: LeaveRequest[] = [];
  activePageItems: LeaveRequest[] = [];

  constructor(protected leaveService: LeaveRequestService) {
    super();
    leaveService.items$.subscribe((value) => {
      this.leaveRequests = value;
    });
  }

  ngOnInit(): void {
    this.leaveService
      .getAll()
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

  trackByRequestId(index: number, item: LeaveRequest): number {
    return parseInt(item.leaveID);
  }
}
