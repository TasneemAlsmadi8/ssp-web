import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncashmentRequestService } from 'src/app/shared/services/requests/encashment.service';
import { EncashmentRequest } from 'src/app/shared/interfaces/requests/encashment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EncashmentRequestDetailsComponent } from './encashment-request-details/encashment-request-details.component';
import { NewEncashmentRequestComponent } from './new-encashment-request/new-encashment-request.component';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { CancelRequestPopupComponent } from 'src/app/shared/components/requests/cancel-request-popup/cancel-request-popup.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { RequestPageComponentTemplate } from 'src/app/shared/components/requests/request-page-template.component';

@Component({
  selector: 'app-requests-encashments',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    EncashmentRequestDetailsComponent,
    RequestDetailsButtonComponent,
    NewEncashmentRequestComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
  ],
  templateUrl: './requests-encashments.component.html',
  styleUrls: ['./requests-encashments.component.scss'],
})
export class RequestsEncashmentsComponent extends RequestPageComponentTemplate<EncashmentRequest> {
  constructor(protected encashmentService: EncashmentRequestService) {
    super(encashmentService);
  }

  override trackByRequestId(index: number, item: EncashmentRequest): number {
    return parseInt(item.encashID);
  }
}
