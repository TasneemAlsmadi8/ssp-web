import { AbstractControl } from '@angular/forms';

export interface FormErrorMessageBehavior {
  showAllErrors: boolean;

  shouldDisplayError(formControlName: string, onlyDirty: boolean): boolean;
  getErrorMessage(
    formControlName: string,
    inputTitle: string,
    customMessage?: string
  ): string;

  additionalErrorMessages?(
    control: AbstractControl,
    inputTitle: string,
    customMessage?: string
  ): string | null;

  resetInvalidInputs?(): void;
}
