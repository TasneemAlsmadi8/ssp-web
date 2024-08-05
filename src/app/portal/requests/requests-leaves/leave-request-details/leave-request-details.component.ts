import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LeaveRequest,
  LeaveRequestType,
  LeaveRequestUpdate,
} from 'src/app/shared/interfaces/requests/leave';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { takeUntil } from 'rxjs';
import {
  FormValues,
  RequestDetailsComponentTemplate,
} from 'src/app/shared/components/requests/request-details-template.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  greaterThanOrEqual,
  relativeErrorMessages,
  smallerThanOrEqual,
} from 'src/app/shared/utils/relative-validators';

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
  leaveTypes!: LeaveRequestType[];

  constructor(private leaveRequestService: LeaveRequestService) {
    super(leaveRequestService, {
      leaveType: ['', [Validators.required]],
      fromTime: [
        '',
        [Validators.required, smallerThanOrEqual('toTime', 'To Time')],
      ],
      toTime: [
        '',
        [Validators.required, greaterThanOrEqual('fromTime', 'From Time')],
      ],
      fromDate: [
        '',
        [Validators.required, smallerThanOrEqual('toDate', 'To Time')],
      ],
      toDate: [
        '',
        [Validators.required, greaterThanOrEqual('fromDate', 'To Time')],
      ],
      remarks: [''],
    });
  }

  override getDynamicValues(): void {
    if (this.isCurrentEmployee) {
      this.leaveRequestService
        .getTypes()
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.leaveTypes = value;
        });
    } else {
      if (!this.item.employeeId) throw new Error('employee id not specified');
      this.leaveRequestService
        .getTypesByEmployeeId(this.item.employeeId)
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
  override additionalErrorMessages(
    control: AbstractControl<any, any>,
    inputTitle: string
  ): string | null {
    for (let error in relativeErrorMessages) {
      if (control.hasError(error))
        return `${this.translate.instant(
          relativeErrorMessages[error]
        )} ${control.getError(error)?.otherControlTitle}`;
    }

    return null;
  }
}
