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
 * Converts a date string from various formats to display format (dd/mm/yyyy).
 * @param {string} dateString - The date string in ISO format.
 * @returns {string} The date string converted to display format (dd/mm/yyyy).
 * @throws {Error} Throws an error if the input date format is invalid.
 *
 * Supported formats:
 * - "dd/mm/yyyy": Date format with day, month, and year separated by slashes.
 * - "yyyy/mm/dd": Date format with year, month, and day separated by slashes.
 * - "yyyy-mm-dd": Date format with year, month, and day separated by hyphens.
 * - "dd-mm-yyyy": Date format with day, month, and year separated by hyphens.
 * - Any of the above with time separated by 'T' or ' ' (a space)
 */
export function formatDateToDisplay(dateString: string): string {
  const isoDate = formatDateToISO(dateString); // Convert to ISO format first

  // Extract year, month, and day from the ISO format
  const [year, month, day] = isoDate.split('-');

  // Return the date string in the display format
  return `${day}/${month}/${year}`;
}
