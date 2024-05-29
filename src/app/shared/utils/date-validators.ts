import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

interface RelativeDate {
  days?: number;
  weeks?: number;
  months?: number;
  years?: number;
}

function adjustDate(date: Date, relative: RelativeDate): Date {
  const result = new Date(date);
  if (relative.days) {
    result.setDate(result.getDate() + relative.days);
  }
  if (relative.weeks) {
    result.setDate(result.getDate() + relative.weeks * 7);
  }
  if (relative.months) {
    result.setMonth(result.getMonth() + relative.months);
  }
  if (relative.years) {
    result.setFullYear(result.getFullYear() + relative.years);
  }
  return result;
}

export function minDate(min: Date, relative?: RelativeDate): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const minAdjusted = relative ? adjustDate(min, relative) : min;
    const inputDate = new Date(control.value);
    if (isNaN(inputDate.getTime())) {
      // If the input date is invalid, return null (no error).
      return null;
    }

    return inputDate < minAdjusted
      ? { minDate: { requiredDate: minAdjusted, actualDate: inputDate } }
      : null;
  };
}

export function maxDate(max: Date, relative?: RelativeDate): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const maxAdjusted = relative ? adjustDate(max, relative) : max;
    const inputDate = new Date(control.value);
    if (isNaN(inputDate.getTime())) {
      // If the input date is invalid, return null (no error).
      return null;
    }

    return inputDate > maxAdjusted
      ? { maxDate: { requiredDate: maxAdjusted, actualDate: inputDate } }
      : null;
  };
}
