import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

/**
 * Represents a value and its type for comparison.
 */
interface CompareValue {
  /** The value for comparison. */
  value: number | string;
  /** The type of the value. */
  type: 'strNum' | 'strDate' | 'strTime' | 'number';
}

/**
 * Extracts the value and type for comparison.
 *
 * @param value The value to extract.
 * @returns The extracted value and its type.
 * @throws If the values are not comparable.
 */
const extractCompareValue = (value: string | number): CompareValue => {
  // Check if the value matches the HH:mm format
  const timeRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/;

  if (typeof value === 'number') {
    return { value, type: 'number' };
  } else if (typeof value === 'string') {
    // Check if the value is a valid time string
    if (timeRegex.test(value)) {
      const [hours, minutes] = value.split(':').map(Number);
      const timestamp = hours * 60 + minutes;
      return { value: timestamp, type: 'strTime' };
    }

    const numberValue = Number(value);
    if (!isNaN(numberValue)) {
      return { value: numberValue, type: 'strNum' };
    }

    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return { value: date.getTime(), type: 'strDate' };
    }
  }
  throw new Error(
    'Values are not comparable. Expected type: number, valid date string (yyyy-MM-dd) or time string (HH:mm)'
  );
};

/**
 * Validator function to check if the control value is smaller than the value of another control.
 *
 * @param otherControlName The name of the other control to compare against.
 * @param otherControlTitle The title of the other control to compare against.
 * @returns A validation error if the value is not smaller, otherwise null.
 * @throws If values are not comparable or have different types.
 * @supportedTypes number, date, and valid time string (HH:mm).
.
 */
export function smallerThan(
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null; // Control is not yet associated with a parent.
    }

    const thisValue: CompareValue = extractCompareValue(control.value);
    const otherControl = control.parent.get(otherControlName);

    if (!otherControl) {
      return null; // Other control not found.
    }

    const otherValue: CompareValue = extractCompareValue(otherControl.value);

    if (thisValue.type !== otherValue.type) {
      throw new Error('Values are not comparable. Expected matching types.');
    }

    return thisValue.value < otherValue.value
      ? null
      : {
          smallerThan: {
            requiredValue: otherValue.value,
            actualValue: thisValue.value,
            otherControlTitle,
          },
        };
  };
}

/**
 * Validator function to check if the control value is greater than the value of another control.
 *
 * @param otherControlName The name of the other control to compare against.
 * @param otherControlTitle The title of the other control to compare against.
 * @returns A validation error if the value is not greater, otherwise null.
 * @throws If values are not comparable or have different types.
 * @supportedTypes number, date, and valid time string (HH:mm).
.
 */
export function greaterThan(
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null; // Control is not yet associated with a parent.
    }

    const thisValue: CompareValue = extractCompareValue(control.value);
    const otherControl = control.parent.get(otherControlName);

    if (!otherControl) {
      return null; // Other control not found.
    }

    const otherValue: CompareValue = extractCompareValue(otherControl.value);

    if (thisValue.type !== otherValue.type) {
      throw new Error('Values are not comparable. Expected matching types.');
    }

    return thisValue.value > otherValue.value
      ? null
      : {
          greaterThan: {
            requiredValue: otherValue.value,
            actualValue: thisValue.value,
            otherControlTitle,
          },
        };
  };
}

/**
 * Validator function to check if the control value is smaller than or equal to the value of another control.
 *
 * @param otherControlName The name of the other control to compare against.
 * @param otherControlTitle The title of the other control to compare against.
 * @returns A validation error if the value is not smaller or equal, otherwise null.
 * @throws If values are not comparable or have different types.
 * @supportedTypes number, date, and valid time string (HH:mm).
.
 */
export function smallerThanOrEqual(
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null; // Control is not yet associated with a parent.
    }

    const thisValue: CompareValue = extractCompareValue(control.value);
    const otherControl = control.parent.get(otherControlName);

    if (!otherControl) {
      return null; // Other control not found.
    }

    const otherValue: CompareValue = extractCompareValue(otherControl.value);

    if (thisValue.type !== otherValue.type) {
      throw new Error('Values are not comparable. Expected matching types.');
    }

    return thisValue.value <= otherValue.value
      ? null
      : {
          smallerThanOrEqual: {
            requiredValue: otherValue.value,
            actualValue: thisValue.value,
            otherControlTitle,
          },
        };
  };
}

/**
 * Validator function to check if the control value is greater than or equal to the value of another control.
 *
 * @param otherControlName The name of the other control to compare against.
 * @param otherControlTitle The title of the other control to compare against.
 * @returns A validation error if the value is not greater or equal, otherwise null.
 * @throws If values are not comparable or have different types.
 * @supportedTypes number, date, and valid time string (HH:mm).
.
 */
export function greaterThanOrEqual(
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null; // Control is not yet associated with a parent.
    }

    const thisValue: CompareValue = extractCompareValue(control.value);
    const otherControl = control.parent.get(otherControlName);

    if (!otherControl) {
      return null; // Other control not found.
    }

    const otherValue: CompareValue = extractCompareValue(otherControl.value);

    if (thisValue.type !== otherValue.type) {
      throw new Error('Values are not comparable. Expected matching types.');
    }

    return thisValue.value >= otherValue.value
      ? null
      : {
          greaterThanOrEqual: {
            requiredValue: otherValue.value,
            actualValue: thisValue.value,
            otherControlTitle,
          },
        };
  };
}

/**
 * Validator function to check if the control value is equal to the value of another control.
 *
 * @param otherControlName The name of the other control to compare against.
 * @param otherControlTitle The title of the other control to compare against.
 * @returns A validation error if the value is not equal, otherwise null.
 * @throws If values are not comparable or have different types.
 * @supportedTypes number, date, and valid time string (HH:mm).
.
 */
export function equal(
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null; // Control is not yet associated with a parent.
    }

    const thisValue: CompareValue = extractCompareValue(control.value);
    const otherControl = control.parent.get(otherControlName);

    if (!otherControl) {
      return null; // Other control not found.
    }

    const otherValue: CompareValue = extractCompareValue(otherControl.value);

    if (thisValue.type !== otherValue.type) {
      throw new Error('Values are not comparable. Expected matching types.');
    }

    return thisValue.value === otherValue.value
      ? null
      : {
          equal: {
            requiredValue: otherValue.value,
            actualValue: thisValue.value,
            otherControlTitle,
          },
        };
  };
}

/**
 * Validator function to check if the control value is not equal to the value of another control.
 *
 * @param otherControlName The name of the other control to compare against.
 * @param otherControlTitle The title of the other control to compare against.
 * @returns A validation error if the value is equal, otherwise null.
 * @throws If values are not comparable or have different types.
 * @supportedTypes number, date, and valid time string (HH:mm).
.
 */
export function notEqual(
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null; // Control is not yet associated with a parent.
    }

    const thisValue: CompareValue = extractCompareValue(control.value);
    const otherControl = control.parent.get(otherControlName);

    if (!otherControl) {
      return null; // Other control not found.
    }

    const otherValue: CompareValue = extractCompareValue(otherControl.value);

    if (thisValue.type !== otherValue.type) {
      throw new Error('Values are not comparable. Expected matching types.');
    }

    return thisValue.value !== otherValue.value
      ? null
      : {
          notEqual: {
            requiredValue: otherValue.value,
            actualValue: thisValue.value,
            otherControlTitle,
          },
        };
  };
}

export const relativeErrorMessages: { [key: string]: string } = {
  smallerThan: 'must be smaller than',
  greaterThan: 'must be greater than',
  smallerThanOrEqual: 'must be smaller than or equal to',
  greaterThanOrEqual: 'must be greater than or equal to',
  equal: 'must be equal to',
  notEqual: 'must not be equal to',
};
