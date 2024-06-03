import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EncashmentRequest,
  EncashmentRequestAddSchema,
  EncashmentRequestType,
  EncashmentValue,
} from 'src/app/shared/interfaces/requests/encashment';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { EncashmentRequestService } from 'src/app/shared/services/requests/encashment.service';
import { takeUntil } from 'rxjs';
import { Project } from 'src/app/shared/interfaces/project';
import { ProjectsService } from 'src/app/shared/services/projects.service';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { LeaveRequestBalance } from 'src/app/shared/interfaces/requests/leave';
import { NewRequestModalComponent } from 'src/app/shared/components/requests/new-request-modal/new-request-modal.component';
import { NewRequestComponentTemplate } from 'src/app/shared/components/requests/new-request-template.component';
import { limitNumberInput } from 'src/app/shared/utils/form-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-new-encashment-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    NewRequestModalComponent,
    TranslateModule,
  ],
  templateUrl: './new-encashment-request.component.html',
  styleUrls: ['./new-encashment-request.component.scss'],
})
export class NewEncashmentRequestComponent extends NewRequestComponentTemplate<
  EncashmentRequest,
  EncashmentRequestAddSchema
> {
  item: EncashmentRequest = {
    encashID: '',
    u_EmployeeID: '',
    encashName: '',
    value: '',
    date: '',
    status: '',
    remarks: '',
    encashCode: '',
    u_Status: null,
    createDate: '',
    u_ApprStatus1: null,
    u_ApprStatus2: null,
    u_ApprStatus3: null,
    projectCode: '',
    unitPrice: '',
    unitCount: '',
    loanID: null,
    installmentCount: null,
    sortDate: '',
    u_AttachFile: '',
  };

  encashmentTypes: EncashmentRequestType[] = [];
  projects: Project[] = [];
  leaveBalance?: LeaveRequestBalance;
  encashValue?: EncashmentValue;

  constructor(
    private encashmentRequestService: EncashmentRequestService,
    private leaveRequestService: LeaveRequestService,
    private projectsService: ProjectsService
  ) {
    const today = new Date().toISOString().slice(0, 10);
    super(encashmentRequestService, {
      encashmentType: ['', [Validators.required]],
      unitPrice: [0, [Validators.min(0)]],
      unitCount: [1, [Validators.required, Validators.min(1)]],
      date: [today, [Validators.required]],
      project: [''],
      remarks: [''],
    });
  }

  override mapFormToAddRequest(formValues: any): EncashmentRequestAddSchema {
    return {
      u_EmployeeID: '',
      // u_EncashValue:
      // this.encashValue?.paidVacationValue.toString() ?? undefined,
      // TODO: should I send it?
      u_EncashType: formValues.encashmentType ?? undefined,
      u_Date: formValues.date ?? undefined,
      u_UnitPrice: formValues.unitPrice?.toString() ?? undefined,
      u_UnitCount: formValues.unitCount?.toString() ?? undefined,
      u_ProjectCode: formValues.project ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
    };
  }

  override getDynamicValues(): void {
    this.encashmentRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.encashmentTypes = value;
        this.encashmentTypes.unshift({
          code: '',
          name: '',
        });
      });
    this.projectsService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.projects = value;
      });
  }

  override updateCalculatedValues() {
    const date = this.form.get('date')?.value;
    const encashmentType = this.form.get('encashmentType')?.value;
    const unitCount = this.form.get('unitCount')?.value;
    if (date && encashmentType) {
      this.updateLeaveBalance(encashmentType, date);
      if (unitCount) {
        this.updateEncashValue(encashmentType, unitCount, date);
      } else {
        delete this.encashValue;
      }
    } else {
      delete this.leaveBalance;
      delete this.encashValue;
    }
  }

  override resetInvalidInputs(): void {
    const unitCountControl = this.form.get('unitCount');
    const unitPriceControl = this.form.get('unitPrice');
    if (!unitCountControl || !unitPriceControl)
      throw new Error('Invalid form Control');

    limitNumberInput(unitCountControl);
    limitNumberInput(unitPriceControl);
  }

  private updateEncashValue(
    encashmentType: string,
    unitCount: string,
    date: string
  ) {
    this.encashmentRequestService
      .getEncashValue(encashmentType, unitCount, date)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.encashValue = value[0];
        console.log(this.encashValue);
      });
  }

  private updateLeaveBalance(encashmentType: string, date: string) {
    this.leaveRequestService
      .getBalance(encashmentType, date)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.leaveBalance = value[0];
        console.log(this.leaveBalance.leaveBalance + ' balance');
      });
  }
}
