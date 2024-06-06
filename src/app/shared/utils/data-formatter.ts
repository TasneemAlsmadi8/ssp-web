export function formatFloat(
  input: string | number,
  decimalPlaces: number = 2
): string {
  const number = typeof input === 'string' ? parseFloat(input) : input;
  return number.toFixed(decimalPlaces);
}

/**
 * Converts a date string from various formats to standard ISO format (yyyy-mm-dd).
 * @param {string} dateString - The date string to be converted.
 * @returns {string} The date string converted to ISO format (yyyy-mm-dd).
 * @throws {Error} Throws an error if the input date format is invalid.
 *
 * Supported formats:
 * - "dd/mm/yyyy": Date format with day, month, and year separated by slashes.
 * - "yyyy/mm/dd": Date format with year, month, and day separated by slashes.
 * - "yyyy-mm-dd": Date format with year, month, and day separated by hyphens.
 * - "dd-mm-yyyy": Date format with day, month, and year separated by hyphens.
 * - Any of the above with time separated by 'T' or ' ' (a space)
 */
export function formatDateToISO(dateString: string): string {
  // Regular expressions to match different date formats
  const patterns = [
    { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, format: 'dd/mm/yyyy' },
    { regex: /^(\d{4})\/(\d{2})\/(\d{2})$/, format: 'yyyy/mm/dd' },
    { regex: /^(\d{4})-(\d{2})-(\d{2})$/, format: 'yyyy-mm-dd' },
    { regex: /^(\d{2})-(\d{2})-(\d{4})$/, format: 'dd-mm-yyyy' },
  ];

  // Extract date part from the input string (if it contains time)
  const datePart = dateString.split(/[T\s]/)[0];

  for (const { regex, format } of patterns) {
    const match = datePart.match(regex);
    if (match) {
      let year!: string, month!: string, day!: string;
      switch (format) {
        case 'dd/mm/yyyy':
        case 'dd-mm-yyyy':
          [, day, month, year] = match;
          break;
        case 'yyyy/mm/dd':
        case 'yyyy-mm-dd':
          [, year, month, day] = match;
          break;
      }
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  throw new Error(
    'Invalid date format. Supported formats: "dd/mm/yyyy", "yyyy/mm/dd", "yyyy-mm-dd", "dd-mm-yyyy".'
  );
}

/**
 * Converts a time string to HH:mm format.
 *
 * This function takes a time string in various formats (HHmm, Hmm, mm, or m)
 * and converts it to the standard HH:mm format.
 *
 * @param input - A string representing the time.
 * @returns A string representing the time in HH:mm format.
 * @throws Error if the input string is not in a valid format.
 *
 * @example
 * ```
 * formatTimeToHHmm("1234"); // Returns "12:34"
 * formatTimeToHHmm("834");  // Returns "08:34"
 * formatTimeToHHmm("34");   // Returns "00:34"
 * formatTimeToHHmm("9");    // Returns "00:09"
 * ```
 */
export function formatTimeToHHmm(input: string): string {
  if (input.indexOf(':') !== -1) return input;

  let hours: string = '00';
  let minutes: string = '00';

  if (input.length === 4) {
    // HHmm format
    hours = input.slice(0, 2);
    minutes = input.slice(2);
  } else if (input.length === 3) {
    // Hmm format
    hours = '0' + input.charAt(0);
    minutes = input.slice(1);
  } else if (input.length === 2) {
    // mm format
    minutes = input;
  } else if (input.length === 1) {
    // m format
    minutes = '0' + input;
  } else {
    throw new Error('Invalid input format');
  }

  return `${hours}:${minutes}`;
}
