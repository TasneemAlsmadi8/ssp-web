import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const weakPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.value;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const minLength = password.length >= 8;

  const errors = [];

  if (!hasUpperCase) errors.push('Missing uppercase letter');
  if (!hasLowerCase) errors.push('Missing lowercase letter');
  if (!hasNumber) errors.push('Missing number');
  if (!hasSpecialChar) errors.push('Missing special character');
  if (!minLength) errors.push('Password must be at least 8 characters long');

  if (errors.length) {
    return { weakPassword: { errors, actualValue: password } };
  }

  return null;
};

export function matchingPasswords(passwordControlName: string): ValidatorFn {
  return (confirmPasswordControl: AbstractControl): ValidationErrors | null => {
    if (!confirmPasswordControl.parent) {
      return null; // Control is not yet associated with a parent.
    }
    const passwordControl =
      confirmPasswordControl.parent.get(passwordControlName);
    if (!passwordControl) throw new Error('Invalid password control name');

    if (
      confirmPasswordControl.invalid &&
      !confirmPasswordControl.hasError('mustMatch')
    ) {
      return null;
    }

    if (passwordControl.value !== confirmPasswordControl.value) {
      return {
        mustMatch: {
          actualValue: confirmPasswordControl.value,
          requiredValue: passwordControl.value,
        },
      };
    }
    return null;
  };
}
