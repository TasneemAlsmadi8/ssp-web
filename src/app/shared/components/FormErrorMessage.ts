import { AbstractControl } from '@angular/forms';

export interface FormErrorMessageBehavior {
  shouldDisplayError(formControlName: string, onlyDirty: boolean): boolean;
  getErrorMessage(formControlName: string, inputTitle: string): string;

  additionalErrorMessages?(
    control: AbstractControl,
    inputTitle: string
  ): string;

  resetInvalidInputs?(): void;
}
