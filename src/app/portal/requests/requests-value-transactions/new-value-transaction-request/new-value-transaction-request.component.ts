import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ValueTransactionRequest,
  ValueTransactionRequestAddSchema,
  ValueTransactionRequestType,
} from 'src/app/shared/interfaces/requests/value-transaction';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ValueTransactionRequestService } from 'src/app/shared/services/requests/value-transaction.service';
import { takeUntil } from 'rxjs';
import { Project } from 'src/app/shared/interfaces/project';
import { ProjectsService } from 'src/app/shared/services/projects.service';
import { NewRequestModalComponent } from 'src/app/shared/components/requests/new-request-modal/new-request-modal.component';
import { NewRequestComponentTemplate } from 'src/app/shared/components/requests/new-request-template.component';
import { limitNumberInput } from 'src/app/shared/utils/form-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-new-value-transaction-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './new-value-transaction-request.component.html',
  styleUrls: ['./new-value-transaction-request.component.scss'],
})
export class NewValueTransactionRequestComponent extends NewRequestComponentTemplate<
  ValueTransactionRequest,
  ValueTransactionRequestAddSchema
> {
  item: ValueTransactionRequest = {
    valueTranID: '',
    u_EmployeeID: '',
    valueTranName: '',
    value: '',
    date: '',
    status: '',
    remarks: '',
    valueTranCode: '',
    u_Status: null,
    createDate: '',
    u_ApprStatus1: null,
    u_ApprStatus2: null,
    u_ApprStatus3: null,
    projectCode: '',
    sortDate: '',
  };

  valueTransactionTypes: ValueTransactionRequestType[] = [];
  projects: Project[] = [];

  constructor(
    private valueTransactionRequestService: ValueTransactionRequestService,
    private projectsService: ProjectsService
  ) {
    const today = new Date().toISOString().slice(0, 10);
    super(valueTransactionRequestService, {
      valueTransactionType: ['', [Validators.required]],
      value: [0, [Validators.required, Validators.min(1)]],
      date: [today, [Validators.required]],
      project: [''],
      remarks: [''],
    });
  }

  override getDynamicValues(): void {
    this.valueTransactionRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.valueTransactionTypes = value;
      });
    this.projectsService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.projects = value;
      });
  }

  override mapFormToAddRequest(
    formValues: any
  ): ValueTransactionRequestAddSchema {
    const data: ValueTransactionRequestAddSchema = {
      u_EmployeeID: '',
      u_ValueTranType: formValues.valueTransactionType ?? undefined,
      u_TranValue: formValues.value?.toString() ?? undefined,
      u_Date: formValues.date ?? undefined,
      u_ProjectCode: formValues.project ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
    };
    return data;
  }

  override resetInvalidInputs(): void {
    const valueControl = this.form.get('value');
    if (!valueControl) throw new Error('Invalid form control');

    limitNumberInput(valueControl);
  }
}
