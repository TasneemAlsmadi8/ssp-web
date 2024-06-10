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
 * Creates a validator function to compare control values.
 *
 * @param errorKey The key for the validation error.
 * @param comparisonFn The function to compare the control values.
 * @param otherControlName The name of the other control to compare against.
 * @param otherControlTitle The title of the other control to compare against.
 * @returns A validator function.
 */
const createComparatorValidator = (
  errorKey: string,
  comparisonFn: (a: number | string, b: number | string) => boolean,
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn => {
  let errorsOnChangeSynced = false;
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
    // TODO: find better way
    if (!errorsOnChangeSynced) {
      otherControl.valueChanges.subscribe(() =>
        control.updateValueAndValidity({ onlySelf: true, emitEvent: false })
      );
      errorsOnChangeSynced = true;
    }

    return comparisonFn(thisValue.value, otherValue.value)
      ? null
      : {
          [errorKey]: {
            requiredValue: otherValue.value,
            actualValue: thisValue.value,
            otherControlTitle,
          },
        };
  };
};

export const smallerThan = (
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn =>
  createComparatorValidator(
    'smallerThan',
    (a, b) => a < b,
    otherControlName,
    otherControlTitle
  );

export const greaterThan = (
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn =>
  createComparatorValidator(
    'greaterThan',
    (a, b) => a > b,
    otherControlName,
    otherControlTitle
  );

export const smallerThanOrEqual = (
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn =>
  createComparatorValidator(
    'smallerThanOrEqual',
    (a, b) => a <= b,
    otherControlName,
    otherControlTitle
  );

export const greaterThanOrEqual = (
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn =>
  createComparatorValidator(
    'greaterThanOrEqual',
    (a, b) => a >= b,
    otherControlName,
    otherControlTitle
  );

export const equal = (
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn =>
  createComparatorValidator(
    'equal',
    (a, b) => a === b,
    otherControlName,
    otherControlTitle
  );

export const notEqual = (
  otherControlName: string,
  otherControlTitle: string
): ValidatorFn =>
  createComparatorValidator(
    'notEqual',
    (a, b) => a !== b,
    otherControlName,
    otherControlTitle
  );

export const relativeErrorMessages: { [key: string]: string } = {
  smallerThan: 'must be smaller than',
  greaterThan: 'must be greater than',
  smallerThanOrEqual: 'must be smaller than or equal to',
  greaterThanOrEqual: 'must be greater than or equal to',
  equal: 'must be equal to',
  notEqual: 'must not be equal to',
};
