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
import { CancelRequestPopupComponent } from 'src/app/shared/components/requests/cancel-request-popup/cancel-request-popup.component';

@Component({
  selector: 'app-requests-encashments',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    EncashmentRequestDetailsComponent,
    NewEncashmentRequestComponent,
    PaginatedTableComponent,
    CancelRequestPopupComponent,
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

  constructor(protected encashmentService: EncashmentRequestService) {
    super();
    encashmentService.items$.subscribe((value) => {
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

  trackByRequestId(index: number, item: EncashmentRequest): number {
    return parseInt(item.encashID);
  }
}
