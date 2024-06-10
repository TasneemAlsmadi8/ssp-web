import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OvertimeRequest,
  OvertimeRequestAdd,
  OvertimeRequestType,
} from 'src/app/shared/interfaces/requests/overtime';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { OvertimeRequestService } from 'src/app/shared/services/requests/overtime.service';
import { takeUntil } from 'rxjs';
import { Project } from 'src/app/shared/interfaces/project';
import { ProjectsService } from 'src/app/shared/services/projects.service';
import { NewRequestModalComponent } from 'src/app/shared/components/requests/new-request-modal/new-request-modal.component';
import { NewRequestComponentTemplate } from 'src/app/shared/components/requests/new-request-template.component';
import { limitNumberInput } from 'src/app/shared/utils/form-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-new-overtime-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    NewRequestModalComponent,
    TranslateModule,
  ],
  templateUrl: './new-overtime-request.component.html',
  styleUrls: ['./new-overtime-request.component.scss'],
})
export class NewOvertimeRequestComponent extends NewRequestComponentTemplate<
  OvertimeRequest,
  OvertimeRequestAdd
> {
  item: OvertimeRequest = {
    id: '',
    overtimeType: '',
    date: '',
    status: 'Pending',
    overtimeCode: '',
    hour: 0,
    minute: 0,
    remarks: '',
    projectCode: '',
    projectName: '',
    overtimeHours: 0,
  };

  overtimeTypes: OvertimeRequestType[] = [];
  projects: Project[] = [];

  constructor(
    private overtimeRequestService: OvertimeRequestService,
    private projectsService: ProjectsService
  ) {
    const today = new Date().toISOString().slice(0, 10);
    super(
      overtimeRequestService,
      {
        overtimeType: ['', [Validators.required]],
        date: [today, [Validators.required]],
        hours: [1, [Validators.required, Validators.min(0)]],
        minutes: [
          0,
          [Validators.required, Validators.min(0), Validators.max(59)],
        ],
        project: ['', [Validators.required]],
        remarks: [''],
      },
      {
        validators: [
          (control: AbstractControl): ValidationErrors | null => {
            const hoursControl = control.get('hours');
            const minutesControl = control.get('minutes');

            if (hoursControl && minutesControl) {
              const hours = hoursControl.value;
              const minutes = minutesControl.value;

              if (hours === 0 && minutes === 0) {
                hoursControl.setErrors({ invalidTime: true });
                minutesControl.setErrors({ invalidTime: true });
                return { invalidTime: true };
              } else {
                if (hoursControl.hasError('invalidTime')) {
                  hoursControl.updateValueAndValidity({ onlySelf: true });
                }
                if (minutesControl.hasError('invalidTime')) {
                  minutesControl.updateValueAndValidity({ onlySelf: true });
                }
              }
            }

            return null;
          },
        ],
      }
    );
  }

  override getDynamicValues(): void {
    this.overtimeRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.overtimeTypes = value;
      });
    this.projectsService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.projects = value;
      });
  }

  override mapFormToAddRequest(formValues: any): OvertimeRequestAdd {
    const data: OvertimeRequestAdd = {
      overtimeCode: formValues.overtimeType,
      fromDate: formValues.date,
      toDate: formValues.date,
      hour: formValues.hours,
      minute: formValues.minutes,
      projectCode: formValues.project ?? undefined, // todo: ask if change to name
      remarks: formValues.remarks ?? undefined,
    };
    return data;
  }
  override resetInvalidInputs(): void {
    const hoursControl = this.form.get('hours');
    const minutesControl = this.form.get('minutes');
    if (!hoursControl || !minutesControl)
      throw new Error('Invalid form control');

    limitNumberInput(hoursControl);
    limitNumberInput(minutesControl);
  }

  override additionalErrorMessages(
    control: AbstractControl<any, any>,
    inputTitle: string
  ): string | null {
    if (control.hasError('invalidTime')) {
      return `both hours and minutes cannot be zero simultaneously`;
    }

    return null;
  }
}
