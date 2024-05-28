import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EncashmentRequest,
  EncashmentRequestType,
  EncashmentRequestUpdateSchema,
  EncashmentValue,
} from 'src/app/shared/interfaces/requests/encashment';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { faEye, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LocalUserService } from 'src/app/shared/services/local-user.service';
import { User } from 'src/app/shared/interfaces/user';
import { EncashmentRequestService } from 'src/app/shared/services/requests/encashment.service';
import { takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Project } from 'src/app/shared/interfaces/project';
import { ProjectsService } from 'src/app/shared/services/projects.service';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { LeaveRequestBalance } from 'src/app/shared/interfaces/requests/leave';
import { formatDateToISO } from 'src/app/shared/utils/data-formatter';
import { RequestDetailsModalComponent } from 'src/app/shared/components/requests/request-details-modal/request-details-modal.component';
import { RequestDetailsComponentTemplate } from 'src/app/shared/components/requests/request-details-template.component';

@Component({
  selector: 'app-encashment-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    RequestDetailsModalComponent,
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
      encashmentType: [''],
      unitPrice: [''],
      date: [''],
      unitCount: [''],
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
        // this.encashmentTypes.unshift({
        //   code: '',
        //   name: '',
        // });
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

  override mapItemFieldsToFormValues(item: EncashmentRequest) {
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
}
