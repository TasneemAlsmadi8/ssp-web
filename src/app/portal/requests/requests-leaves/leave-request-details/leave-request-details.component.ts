import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LeaveRequest,
  LeaveRequestType,
  LeaveRequestUpdate,
} from 'src/app/shared/interfaces/requests/leave';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { takeUntil } from 'rxjs';
import {
  FormValues,
  RequestDetailsComponentTemplate,
} from 'src/app/shared/components/requests/request-details-template.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-leave-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './leave-request-details.component.html',
  styleUrls: ['./leave-request-details.component.scss'],
})
export class LeaveRequestDetailsComponent extends RequestDetailsComponentTemplate<
  LeaveRequest,
  LeaveRequestUpdate
> {
  @Input() employeeId?: string;
  leaveTypes!: LeaveRequestType[];

  constructor(private leaveRequestService: LeaveRequestService) {
    super(leaveRequestService, {
      leaveType: ['', [Validators.required]],
      fromTime: ['', [Validators.required]],
      toTime: ['', [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      remarks: [''],
    });
  }

  override getDynamicValues(): void {
    if (!this.employeeId) {
      this.leaveRequestService
        .getTypes()
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.leaveTypes = value;
        });
    } else {
      this.leaveRequestService
        .getTypesByEmployeeId(this.employeeId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.leaveTypes = value;
        });
    }
  }
  override mapFormToUpdateRequest(formValues: any): LeaveRequestUpdate {
    const data: LeaveRequestUpdate = {
      id: this.item.id,
      leaveCode: formValues.leaveType ?? undefined,
      fromDate: formValues.fromDate ?? undefined,
      toDate: formValues.toDate ?? undefined,
      fromTime: formValues.fromTime ?? undefined,
      toTime: formValues.toTime ?? undefined,
      remarks: formValues.remarks ?? undefined,
    };
    return data;
  }
  override mapItemFieldsToFormValues(
    item: LeaveRequest
  ): FormValues<typeof this.formControls> {
    return {
      leaveType: item.leaveCode,
      fromTime: item.fromTime,
      toTime: item.toTime,
      fromDate: item.fromDate,
      toDate: item.toDate,
      remarks: item.remarks,
    };
  }
}
