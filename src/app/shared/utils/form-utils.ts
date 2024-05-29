import { AbstractControl } from '@angular/forms';

export function limitNumberInput(formControl: AbstractControl): void {
  if (formControl.hasError('min')) {
    const min = formControl.getError('min')?.min;
    formControl.setValue(min, { emitEvent: false });
  } else if (formControl.hasError('max')) {
    const max = formControl.getError('max')?.max;
    formControl.setValue(max, { emitEvent: false });
  }
}
