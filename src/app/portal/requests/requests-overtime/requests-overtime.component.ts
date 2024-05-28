import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OvertimeRequestService } from 'src/app/shared/services/requests/overtime.service';
import { OvertimeRequest } from 'src/app/shared/interfaces/requests/overtime';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OvertimeRequestDetailsComponent } from './overtime-request-details/overtime-request-details.component';
import { NewOvertimeRequestComponent } from './new-overtime-request/new-overtime-request.component';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { CancelRequestPopupComponent } from 'src/app/shared/components/requests/cancel-request-popup/cancel-request-popup.component';
import { RequestPageComponentTemplate } from 'src/app/shared/components/requests/request-page-template.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';

@Component({
  selector: 'app-requests-overtime',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    OvertimeRequestDetailsComponent,
    RequestDetailsButtonComponent,
    NewOvertimeRequestComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
  ],
  templateUrl: './requests-overtime.component.html',
  styleUrls: ['./requests-overtime.component.scss'],
})
export class RequestsOvertimeComponent extends RequestPageComponentTemplate<OvertimeRequest> {
  constructor(protected overtimeService: OvertimeRequestService) {
    super(overtimeService);
  }

  override trackByRequestId(index: number, item: OvertimeRequest): number {
    return parseInt(item.overtimeID);
  }
}
