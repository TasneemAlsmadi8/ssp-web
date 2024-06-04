import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import {
  EmployeePatch,
  EmployeeResponse,
} from 'src/app/shared/interfaces/Employee';
import { EmployeeInfoService } from 'src/app/shared/services/employee-info.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserAlertService } from 'src/app/shared/services/user-alert.service';
import { FormErrorMessageBehavior } from 'src/app/shared/components/FormErrorMessage';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-employee-info',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, NgClass, NgIf],
  templateUrl: './employee-info.component.html',
  styleUrls: ['./employee-info.component.scss'],
})
export class EmployeeInfoComponent
  extends DestroyBaseComponent
  implements OnInit, FormErrorMessageBehavior
{
  constructor(
    private employeeInfoService: EmployeeInfoService,
    private userAlertService: UserAlertService,
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) {
    super();
    this.form = this.formBuilder.group({
      mobile: ['', [Validators.required, Validators.pattern('^[+]?[0-9]+$')]],
      homeTel: ['', [Validators.pattern('^[+]?[0-9]+$')]],
      homeStreet: ['', [Validators.required]],
      homeBuild: ['', [Validators.required]],
      homeBlock: [''],
      homeZip: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }
  shouldDisplayError(formControlName: string, onlyDirty = false): boolean {
    const control = this.form.get(formControlName);
    if (!control) throw new Error('Invalid form Control');

    if (onlyDirty) return control.invalid && control.dirty;
    return control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(
    formControlName: string,
    inputTitle: string = 'Value',
    customMessage: string = ''
  ): string {
    const control = this.form.get(formControlName);
    if (!control) throw new Error('Invalid form control');

    inputTitle = this.translate.instant(inputTitle);
    if (customMessage) customMessage = this.translate.instant(customMessage);

    if (control.hasError('required')) {
      return `${inputTitle} ${this.translate.instant(
        'is required'
      )}.${customMessage}`;
    }
    if (control.hasError('pattern')) {
      return `${inputTitle} ${this.translate.instant(
        'does not match the required pattern'
      )}.${customMessage}`;
    }
    return '';
  }

  form: FormGroup;

  employee?: EmployeeResponse;
  isLoading = false;

  ngOnInit(): void {
    this.employeeInfoService
      .getEmployeeInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.employee = value[0];
          // console.log(this.employee);
          this.setInputsDefaultValues();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  setInputsDefaultValues() {
    this.form.get('mobile')?.setValue(this.employee?.mobile ?? '');
    this.form.get('homeTel')?.setValue(this.employee?.homeTel ?? '');
    this.form.get('homeStreet')?.setValue(this.employee?.homeStreet ?? '');
    this.form.get('homeBuild')?.setValue(this.employee?.homeBuild ?? '');
    this.form.get('homeBlock')?.setValue(this.employee?.homeBlock ?? '');
    this.form.get('homeZip')?.setValue(this.employee?.homeZip ?? '');
  }

  onSubmit() {
    this.isLoading = true;
    const formValues = this.form.value;
    const data: EmployeePatch = {
      employeeID: '',
      homeBlock: formValues.homeBlock!,
      homeZipCode: formValues.homeZip!,
      homeStreet: formValues.homeStreet!,
      homeBuildingFloorRoom: formValues.homeBuild!,
      mobilePhone: formValues.mobile!,
      homePhone: formValues.homeTel!,
    };
    this.employeeInfoService
      .updateEmployeeInfo(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.userAlertService.showSuccess(
            'Saved!',
            'Information updated successfully'
          );
        },
        error: (err: HttpErrorResponse) => {
          this.userAlertService.showError('Error!');
          console.log(err);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
