import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EncashmentRequest,
  EncashmentRequestAdd,
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
  EncashmentRequestAdd
> {
  item: EncashmentRequest = {
    id: '',
    encashName: '',
    value: 0,
    date: '',
    status: 'Pending',
    remarks: '',
    encashCode: '',
    createDate: '',
    projectCode: '',
    unitPrice: 0,
    unitCount: 0,
    loanId: null,
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
      unitCount: [1, [Validators.required, Validators.min(1)]],
      date: [today, [Validators.required]],
      project: [''],
      remarks: [''],
    });
  }

  override mapFormToAddRequest(formValues: any): EncashmentRequestAdd {
    return {
      value: this.encashValue?.paidVacationValue ?? 0,
      // TODO: should I send it?
      encashCode: formValues.encashmentType,
      date: formValues.date,
      unitCount: formValues.unitCount,
      projectCode: formValues.project,
      remarks: formValues.remarks ?? undefined,
    };
  }

  override getDynamicValues(): void {
    this.encashmentRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.encashmentTypes = value;
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
    if (!unitCountControl)
      throw new Error('Invalid form Control');

    limitNumberInput(unitCountControl);
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
        // console.log(this.encashValue);
      });
  }

  private updateLeaveBalance(encashmentType: string, date: string) {
    this.leaveRequestService
      .getBalance(encashmentType, date)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.leaveBalance = value[0];
        // console.log(this.leaveBalance.leaveBalance + ' balance');
      });
  }
}
