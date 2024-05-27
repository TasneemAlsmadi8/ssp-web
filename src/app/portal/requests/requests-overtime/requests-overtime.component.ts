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
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { CancelRequestPopupComponent } from 'src/app/shared/components/requests/cancel-request-popup/cancel-request-popup.component';

@Component({
  selector: 'app-requests-overtime',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    OvertimeRequestDetailsComponent,
    NewOvertimeRequestComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
  ],
  templateUrl: './requests-overtime.component.html',
  styleUrls: ['./requests-overtime.component.scss'],
})
export class RequestsOvertimeComponent
  extends DestroyBaseComponent
  implements OnInit
{
  overtimeRequests: OvertimeRequest[] = [];
  activePageItems: OvertimeRequest[] = [];

  constructor(protected overtimeService: OvertimeRequestService) {
    super();
    overtimeService.items$.subscribe((value) => {
      this.overtimeRequests = value;
    });
  }

  ngOnInit(): void {
    this.overtimeService
      .getAll()
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

  trackByRequestId(index: number, item: OvertimeRequest): number {
    return parseInt(item.overtimeID);
  }
}
