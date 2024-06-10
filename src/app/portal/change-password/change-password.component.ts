import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/shared/services/auth.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { UserAlertService } from 'src/app/shared/services/user-alert.service';
import { FormErrorMessageBehavior } from 'src/app/shared/components/FormErrorMessage';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { takeUntil } from 'rxjs';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import {
  matchingPasswords,
  weakPasswordValidator,
} from 'src/app/shared/utils/password-validators';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ModalComponent, ReactiveFormsModule, TranslateModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent
  extends DestroyBaseComponent
  implements FormErrorMessageBehavior
{
  @Input() class: string = '';
  form: FormGroup;
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private userAlertService: UserAlertService,
    private translate: TranslateService
  ) {
    super();
    this.form = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, weakPasswordValidator]],
      confirmNewPassword: [
        '',
        [Validators.required, matchingPasswords('newPassword')],
      ],
    });

    this.form.get('newPassword')!.valueChanges.subscribe(() => {
      this.form.get('confirmNewPassword')?.updateValueAndValidity();
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
    if (control.hasError('mustMatch')) {
      return this.translate.instant('passwords do not match.');
    }
    if (control.hasError('weakPassword')) {
      // let errors: string[] = control.getError('weakPassword').errors;
      // errors = errors.map((value) => {
      //   return this.translate.instant(value);
      // });
      // return (
      //   (this.translate.instant(
      //     'password is too weak. Please use a stronger password.\n'
      //   ) as string) + errors.join('\n')
      // );
      return this.translate.instant(
        'Password is too weak. (At least 8 chars, Contains: uppercase, lowercase, number, special char)'
      );
    }

    return '';
  }

  onSubmit() {
    this.userAlertService.showLoading('Changing Password...');
    const oldPassword: string = this.form.value.oldPassword;
    const newPassword: string = this.form.value.newPassword;

    this.authService
      .changePassword(oldPassword, newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.userAlertService.showSuccess(
            'Success!',
            'Password changed successfully'
          );
        },
        error: () => {
          this.userAlertService.showError(
            'Error!',
            'Failed to change password'
          );
        },
      });
  }
}
