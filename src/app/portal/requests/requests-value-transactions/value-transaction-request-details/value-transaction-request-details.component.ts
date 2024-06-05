import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ValueTransactionRequest,
  ValueTransactionRequestType,
  ValueTransactionRequestUpdate,
} from 'src/app/shared/interfaces/requests/value-transaction';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ValueTransactionRequestService } from 'src/app/shared/services/requests/value-transaction.service';
import { takeUntil } from 'rxjs';
import { Project } from 'src/app/shared/interfaces/project';
import { ProjectsService } from 'src/app/shared/services/projects.service';
import { formatDateToISO } from 'src/app/shared/utils/data-formatter';
import {
  FormValues,
  RequestDetailsComponentTemplate,
} from 'src/app/shared/components/requests/request-details-template.component';
import { limitNumberInput } from 'src/app/shared/utils/form-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-value-transaction-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './value-transaction-request-details.component.html',
  styleUrls: ['./value-transaction-request-details.component.scss'],
})
export class ValueTransactionRequestDetailsComponent extends RequestDetailsComponentTemplate<
  ValueTransactionRequest,
  ValueTransactionRequestUpdate
> {
  valueTransactionTypes: ValueTransactionRequestType[] = [];
  projects: Project[] = [];

  constructor(
    private valueTransactionRequestService: ValueTransactionRequestService,
    private projectsService: ProjectsService
  ) {
    super(valueTransactionRequestService, {
      valueTransactionType: ['', [Validators.required]],
      value: ['', [Validators.required, Validators.min(0)]],
      date: ['', [Validators.required]],
      project: ['', [Validators.required]],
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

  override mapFormToUpdateRequest(
    formValues: any
  ): ValueTransactionRequestUpdate {
    const data: ValueTransactionRequestUpdate = {
      id: this.item.id,
      valueTranCode: formValues.valueTransactionType ?? undefined,
      value: formValues.value?.toString() ?? undefined,
      date: formValues.date ?? undefined,
      projectCode: formValues.project ?? undefined,
      remarks: formValues.remarks ?? undefined,
    };
    return data;
  }
  override mapItemFieldsToFormValues(
    item: ValueTransactionRequest
  ): FormValues<typeof this.formControls> {
    return {
      valueTransactionType: item.valueTranCode,
      date: formatDateToISO(item.date),
      value: item.value,
      project: item.projectCode,
      remarks: item.remarks,
    };
  }

  override resetInvalidInputs(): void {
    const value = this.form.get('value');
    if (!value) throw new Error('Invalid form Control');

    limitNumberInput(value);
  }
}
