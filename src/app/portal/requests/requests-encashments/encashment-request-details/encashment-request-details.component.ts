import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EncashmentRequest,
  EncashmentRequestType,
  EncashmentRequestUpdateSchema,
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
import { formatDateToISO } from 'src/app/shared/utils/data-formatter';
import {
  FormValues,
  RequestDetailsComponentTemplate,
} from 'src/app/shared/components/requests/request-details-template.component';
import { limitNumberInput } from 'src/app/shared/utils/form-utils';

@Component({
  selector: 'app-encashment-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './encashment-request-details.component.html',
  styleUrls: ['./encashment-request-details.component.scss'],
})
export class EncashmentRequestDetailsComponent extends RequestDetailsComponentTemplate<
  EncashmentRequest,
  EncashmentRequestUpdateSchema
> {
  encashmentTypes: EncashmentRequestType[] = [];
  projects: Project[] = [];
  leaveBalance?: LeaveRequestBalance;
  encashValue?: EncashmentValue;

  constructor(
    private encashmentRequestService: EncashmentRequestService,
    private leaveRequestService: LeaveRequestService,
    private projectsService: ProjectsService
  ) {
    super(encashmentRequestService, {
      encashmentType: ['', [Validators.required]],
      unitPrice: ['', [Validators.min(0)]],
      date: ['', [Validators.required]],
      unitCount: ['', [Validators.required, Validators.min(1)]],
      project: [''],
      remarks: [''],
    });
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
      this.leaveRequestService
        .getBalance(encashmentType, date)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.leaveBalance = value[0];
        });
      if (unitCount) {
        this.encashmentRequestService
          .getEncashValue(encashmentType, unitCount, date)
          .pipe(takeUntil(this.destroy$))
          .subscribe((value) => {
            this.encashValue = value[0];
          });
      }
    }
  }

  override mapItemFieldsToFormValues(item: EncashmentRequest): FormValues {
    return {
      encashmentType: item.encashCode,
      unitPrice: item.unitPrice,
      unitCount: item.unitCount,
      date: formatDateToISO(item.date),
      project: item.projectCode,
      remarks: item.remarks,
    };
  }

  override mapFormToUpdateRequest(
    formValues: any
  ): EncashmentRequestUpdateSchema {
    const data: EncashmentRequestUpdateSchema = {
      docEntry: this.item.encashID,
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
    return data;
  }
  override resetInvalidInputs(): void {
    const unitCountControl = this.form.get('unitCount');
    const unitPriceControl = this.form.get('unitPrice');
    if (!unitCountControl || !unitPriceControl)
      throw new Error('Invalid form Control');

    limitNumberInput(unitCountControl);
    limitNumberInput(unitPriceControl);
  }
}
