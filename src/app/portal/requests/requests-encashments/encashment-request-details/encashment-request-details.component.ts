import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EncashmentRequest,
  EncashmentRequestType,
  EncashmentRequestUpdate,
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
import {
  FormValues,
  RequestDetailsComponentTemplate,
} from 'src/app/shared/components/requests/request-details-template.component';
import { limitNumberInput } from 'src/app/shared/utils/form-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-encashment-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './encashment-request-details.component.html',
  styleUrls: ['./encashment-request-details.component.scss'],
})
export class EncashmentRequestDetailsComponent extends RequestDetailsComponentTemplate<
  EncashmentRequest,
  EncashmentRequestUpdate
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
      date: ['', [Validators.required]],
      unitCount: ['', [Validators.required, Validators.min(1)]],
      project: [''],
      remarks: [''],
    });
  }

  override getDynamicValues(): void {
    if (this.isCurrentEmployee) {
      this.encashmentRequestService
        .getTypes()
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.encashmentTypes = value;
        });
    } else {
      if (!this.item.employeeId) throw new Error('employee id not specified');
      this.encashmentRequestService
        .getTypesByEmployeeId(this.item.employeeId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.encashmentTypes = value;
        });
    }
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
        if (this.isCurrentEmployee) {
          this.encashmentRequestService
            .getEncashValue(encashmentType, unitCount, date)
            .pipe(takeUntil(this.destroy$))
            .subscribe((value) => {
              this.encashValue = value[0];
            });
        } else {
          if (!this.item.employeeId)
            throw new Error('employee id not specified');
          this.encashmentRequestService
            .getEncashValueByEmployeeId(
              this.item.employeeId,
              encashmentType,
              unitCount,
              date
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((value) => {
              this.encashValue = value[0];
            });
        }
      } else {
        delete this.encashValue;
      }
    } else {
      delete this.leaveBalance;
      delete this.encashValue;
    }
  }

  override mapItemFieldsToFormValues(
    item: EncashmentRequest
  ): FormValues<typeof this.formControls> {
    return {
      encashmentType: item.encashCode,
      unitCount: item.unitCount,
      date: item.date,
      project: item.projectCode,
      remarks: item.remarks,
    };
  }

  override mapFormToUpdateRequest(formValues: any): EncashmentRequestUpdate {
    const data: EncashmentRequestUpdate = {
      id: this.item.id,
      // u_EncashValue:
      // this.encashValue?.paidVacationValue.toString() ?? undefined,
      // TODO: should I send it?
      encashCode: formValues.encashmentType ?? undefined,
      date: formValues.date ?? undefined,
      unitCount: formValues.unitCount?.toString() ?? undefined,
      projectCode: formValues.project ?? undefined,
      remarks: formValues.remarks ?? undefined,
      value: this.encashValue?.paidVacationValue ?? 0,
    };
    return data;
  }
  override resetInvalidInputs(): void {
    const unitCountControl = this.form.get('unitCount');
    if (!unitCountControl) throw new Error('Invalid form Control');

    limitNumberInput(unitCountControl);
  }
}
