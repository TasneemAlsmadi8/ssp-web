import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LeaveRequestAdd,
  LeaveRequest,
  LeaveRequestType,
  LeaveRequestBalance,
} from 'src/app/shared/interfaces/requests/leave';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { takeUntil } from 'rxjs';
import { NewRequestModalComponent } from 'src/app/shared/components/requests/new-request-modal/new-request-modal.component';
import { NewRequestComponentTemplate } from 'src/app/shared/components/requests/new-request-template.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-new-leave-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    NewRequestModalComponent,
    TranslateModule,
  ],
  templateUrl: './new-leave-request.component.html',
  styleUrls: ['./new-leave-request.component.scss'],
})
export class NewLeaveRequestComponent extends NewRequestComponentTemplate<
  LeaveRequest,
  LeaveRequestAdd
> {
  item: LeaveRequest = {
    id: '',
    leaveType: '',
    fromDate: '',
    toDate: '',
    fromTime: null,
    toTime: null,
    status: '',
    leaveCode: '',
    paidDays: '',
    unpaidDays: '',
  };

  paidDays: number = 1;
  unPaidDays: number = 0;
  leaveBalance?: LeaveRequestBalance;
  leaveBalanceEndOfYear?: LeaveRequestBalance;

  leaveTypes!: LeaveRequestType[];

  constructor(private leaveRequestService: LeaveRequestService) {
    const today = new Date().toISOString().slice(0, 10);
    super(leaveRequestService, {
      leaveType: ['', [Validators.required]],
      fromTime: ['08:00', [Validators.required]],
      toTime: ['08:00', [Validators.required]],
      fromDate: [today, [Validators.required]],
      toDate: [today, [Validators.required]],
      remarks: [''],
    });
  }

  override getDynamicValues(): void {
    this.leaveRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.leaveTypes = value;
        this.leaveTypes.unshift({ code: '', name: '' });
      });
  }

  override updateCalculatedValues() {
    this.updateLeaveBalance();
    this.updateLeaveDays();
  }

  private updateLeaveBalance() {
    const fromDate = this.form.get('fromDate')?.value;
    const leaveType = this.form.get('leaveType')?.value;

    if (fromDate && leaveType) {
      this.leaveRequestService
        .getBalance(leaveType, fromDate)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.leaveBalance = value[0];
        });
    } else {
      delete this.leaveBalance;
    }
    if (leaveType) {
      const endOfYearDate = `${new Date().getFullYear()}-12-31`;
      this.leaveRequestService
        .getBalance(leaveType, endOfYearDate)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.leaveBalanceEndOfYear = value[0];
        });
    } else {
      delete this.leaveBalanceEndOfYear;
    }
  }

  private updateLeaveDays() {
    const fromDate = this.form.get('fromDate')?.value;
    const toDate = this.form.get('toDate')?.value;
    const fromTime = this.form.get('fromTime')?.value;
    const toTime = this.form.get('toTime')?.value;
    const leaveType = this.form.get('leaveType')?.value;

    if (fromDate === toDate && fromTime === toTime) return;
    if (fromDate && toDate && fromTime && toTime && leaveType) {
      this.leaveRequestService
        .getLeaveDays(leaveType, fromDate, toDate, fromTime, toTime)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          [this.paidDays, this.unPaidDays] = value;
        });
    }
  }

  override mapFormToAddRequest(formValues: any): LeaveRequestAdd {
    const data: LeaveRequestAdd = {
      leaveCode: formValues.leaveType ?? undefined,
      fromDate: formValues.fromDate ?? undefined,
      toDate: formValues.toDate ?? undefined,
      fromTime: formValues.fromTime ?? undefined,
      toTime: formValues.toTime ?? undefined,
      remarks: formValues.remarks ?? undefined,
    };

    return data;
  }
}
