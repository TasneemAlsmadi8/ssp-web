import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { LeaveRequest } from 'src/app/shared/interfaces/requests/leave';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LeaveRequestDetailsComponent } from './leave-request-details/leave-request-details.component';
import { NewLeaveRequestComponent } from './new-leave-request/new-leave-request.component';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { CancelRequestPopupComponent } from 'src/app/shared/components/requests/cancel-request-popup/cancel-request-popup.component';
import { RequestPageComponentTemplate } from 'src/app/shared/components/requests/request-page-template.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-requests-leaves',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LeaveRequestDetailsComponent,
    RequestDetailsButtonComponent,
    NewLeaveRequestComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
    TranslateModule,
  ],
  templateUrl: './requests-leaves.component.html',
  styleUrls: ['./requests-leaves.component.scss'],
})
export class RequestsLeavesComponent extends RequestPageComponentTemplate<LeaveRequest> {
  constructor(protected leaveService: LeaveRequestService) {
    super(leaveService);
  }

  override trackByRequestId(index: number, item: LeaveRequest): number {
    return parseInt(item.id);
  }
}
