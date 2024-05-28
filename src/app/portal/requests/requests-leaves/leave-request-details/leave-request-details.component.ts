import {
  Component,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LeaveRequest,
  LeaveRequestType,
  LeaveRequestUpdateSchema,
} from 'src/app/shared/interfaces/requests/leave';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { takeUntil } from 'rxjs';
import { formatDateToISO } from 'src/app/shared/utils/data-formatter';
import { RequestDetailsModalComponent } from 'src/app/shared/components/requests/request-details-modal/request-details-modal.component';
import {
  FormValues,
  RequestDetailsComponentTemplate,
} from 'src/app/shared/components/requests/request-details-template.component';

@Component({
  selector: 'app-leave-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    RequestDetailsModalComponent,
  ],
  templateUrl: './leave-request-details.component.html',
  styleUrls: ['./leave-request-details.component.scss'],
})
export class LeaveRequestDetailsComponent extends RequestDetailsComponentTemplate<
  LeaveRequest,
  LeaveRequestUpdateSchema
> {
  leaveTypes!: LeaveRequestType[];

  constructor(private leaveRequestService: LeaveRequestService) {
    super(leaveRequestService, {
      leaveType: ['', [Validators.required]],
      fromTime: [''],
      toTime: [''],
      fromDate: [''],
      toDate: [''],
      remarks: [''],
    });
  }

  override getDynamicValues(): void {
    this.leaveRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.leaveTypes = value;
      });
  }
  override mapFormToUpdateRequest(formValues: any): LeaveRequestUpdateSchema {
    const data: LeaveRequestUpdateSchema = {
      docEntry: this.item.leaveID,
      u_LeaveType: formValues.leaveType ?? undefined,
      u_FromDate: formValues.fromDate ?? undefined,
      u_ToDate: formValues.toDate ?? undefined,
      u_FromTime: formValues.fromTime ?? undefined,
      u_ToTime: formValues.toTime ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
    };
    return data;
  }
  override mapItemFieldsToFormValues(item: LeaveRequest): FormValues {
    return {
      leaveType: item.leaveCode,
      fromTime: item.fromTime,
      toTime: item.toTime,
      fromDate: formatDateToISO(item.fromDate),
      toDate: formatDateToISO(item.toDate),
      remarks: item.remarks,
    };
  }
}
