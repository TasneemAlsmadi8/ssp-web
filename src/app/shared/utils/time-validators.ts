import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

interface RelativeTime {
  hours?: number;
  minutes?: number;
}

function adjustTime(baseTime: string, relative: RelativeTime): string {
  const [baseHours, baseMinutes] = baseTime.split(':').map(Number);
  const date = new Date();
  date.setHours(baseHours, baseMinutes);

  if (relative.hours) {
    date.setHours(date.getHours() + relative.hours);
  }
  if (relative.minutes) {
    date.setMinutes(date.getMinutes() + relative.minutes);
  }

  const adjustedHours = date.getHours().toString().padStart(2, '0');
  const adjustedMinutes = date.getMinutes().toString().padStart(2, '0');
  return `${adjustedHours}:${adjustedMinutes}`;
}

export function minTime(min: string, relative?: RelativeTime): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const minAdjusted = relative ? adjustTime(min, relative) : min;
    const inputTime = control.value;

    if (!inputTime) {
      return null; // If the input time is empty, return null (no error).
    }

    return inputTime < minAdjusted
      ? { minTime: { requiredTime: minAdjusted, actualTime: inputTime } }
      : null;
  };
}

export function maxTime(max: string, relative?: RelativeTime): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const maxAdjusted = relative ? adjustTime(max, relative) : max;
    const inputTime = control.value;

    if (!inputTime) {
      return null; // If the input time is empty, return null (no error).
    }

    return inputTime > maxAdjusted
      ? { maxTime: { requiredTime: maxAdjusted, actualTime: inputTime } }
      : null;
  };
}
