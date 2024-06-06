import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ValueTransactionRequest,
  ValueTransactionRequestAdd,
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
    NewRequestModalComponent,
    TranslateModule,
  ],
  templateUrl: './new-value-transaction-request.component.html',
  styleUrls: ['./new-value-transaction-request.component.scss'],
})
export class NewValueTransactionRequestComponent extends NewRequestComponentTemplate<
  ValueTransactionRequest,
  ValueTransactionRequestAdd
> {
  item: ValueTransactionRequest = {
    id: '',
    valueTranName: '',
    value: 0,
    date: '',
    status: 'Pending',
    remarks: '',
    valueTranCode: '',
    createDate: '',
    projectCode: '',
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

  override mapFormToAddRequest(formValues: any): ValueTransactionRequestAdd {
    const data: ValueTransactionRequestAdd = {
      valueTranCode: formValues.valueTransactionType ?? undefined,
      value: formValues.value?.toString() ?? undefined,
      date: formValues.date ?? undefined,
      projectCode: formValues.project ?? undefined,
      remarks: formValues.remarks ?? undefined,
    };
    return data;
  }

  override resetInvalidInputs(): void {
    const valueControl = this.form.get('value');
    if (!valueControl) throw new Error('Invalid form control');

    limitNumberInput(valueControl);
  }
}
