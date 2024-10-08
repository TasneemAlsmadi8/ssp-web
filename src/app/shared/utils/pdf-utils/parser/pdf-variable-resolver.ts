import { AutoTableElementJson } from 'json-schemas/interfaces';
import { Element } from '../elements/abstract-element';
import { ParagraphElement } from '../elements/paragraph-element';
import {
  ComplexDataRecord,
  DataRecord,
  HeadingElementJson,
  ObjectTableElementJson,
  ParagraphElementJson,
  TableCell,
  TableElementJson,
} from './element-json-types';

export type PipeFunction = (value: DataRecordValue, args: string[]) => string;

type DataRecordValue = string | number | null | undefined;

export class PdfVariableResolver {
  private variables: DataRecord = {};
  private static _pipes: Map<string, PipeFunction>;
  public static get pipes(): Map<string, PipeFunction> {
    if (!PdfVariableResolver._pipes) {
      PdfVariableResolver._pipes = new Map();
    }
    return PdfVariableResolver._pipes;
  }

  constructor(variables?: ComplexDataRecord) {
    if (variables) this.setVariables(variables);
    PdfVariableResolver.registerPipe('number', (value, args) => {
      if (
        typeof value === 'string' &&
        !isNaN(parseFloat(value)) &&
        isFinite(Number(value))
      ) {
        value = parseFloat(value);
      }
      if (typeof value !== 'number') {
        console.error(`Value is not a number: '${value}'`);
        return String(value);
      }
      return formatNumber(value, args[0]);
    });
    PdfVariableResolver.registerPipe('date', (value, args) => {
      if (typeof value !== 'string') {
        console.error(`Value is not a date string: '${value}'`);
        return String(value);
      }
      let date = new Date(value);
      if (isNaN(date.getTime())) {
        console.error(`Value is not a date string: '${value}'`);
        return value; // If the date string is invalid, return it as is
      }

      return formatDate(date, args[0]);
    });
  }

  static registerPipe(name: string, pipeFunction: PipeFunction): void {
    PdfVariableResolver.pipes.set(name, pipeFunction);
  }

  private executePipe(
    name: string,
    value: DataRecordValue,
    args: string
  ): string {
    const pipeFunction = PdfVariableResolver.pipes.get(name);
    if (!pipeFunction) {
      console.error(
        `Pipe: ${name} Not Found!\nReturning value as is. value = ${value}`
      );
      return String(value);
    }

    let argsArray: string[] = [];
    if (args.trim().length > 0) argsArray = args.trim().split(/\s+/);

    return pipeFunction(value, argsArray);
  }

  setVariables(variables: ComplexDataRecord) {
    for (const varName in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, varName)) {
        const value = variables[varName];
        if (value && typeof value === 'object') {
          const innerDataRecord = Object.fromEntries(
            Object.entries(value).map((keyValue) => [
              `${varName}.${keyValue[0]}`,
              keyValue[1],
            ])
          );
          this.setVariables(innerDataRecord);
        } else {
          this.variables[varName] = value;
        }
      }
    }
  }

  /**
   * Replaces placeholders in the format {{variableName}}, {{variableName|pipeName:args}} in the given text with corresponding values from the `this.variables` object.
   * Supports formatting for both numbers and dates, as well as custom pipes.
   *
   * @param {string} text - The input text containing placeholders.
   * @returns {string} - The text with placeholders replaced by corresponding values.
   *
   * Default Pipes:
   * - `number`: Formats a number according to the provided format.
   *   - Example: {{price|number:1.2-4}}
   *   - `variableName` should be a number.
   *   - `format` specifies the number format in the format 1.2-4.
   *     - 1: minimum integer digits
   *     - 2: minimum fraction digits
   *     - 4: maximum fraction digits
   * - `date`: Formats a date according to the provided format.
   *   - Example: {{date|date:dd/MM/yyyy}}
   *   - `variableName` should be a date string.
   *   - `format` specifies the format for the date using yyyy, MM, dd, HH, mm, ss.
   *
   * Custom Pipes:
   * - {{variableName|pipeName:args}}: Replaces with the result of the custom pipe.
   *   - `pipeName` should be a function registered using registerPipe(name: string, pipeFunction: PipeFunction)
   *      - type PipeFunction = (value: DataRecordValue, args: string[]) => string;
   *      - type DataRecordValue = string | number | null | undefined;
   *   - `args` are optional arguments to pass to the custom pipe.
   *
   * Example:
   * this.variables = { price: 12.567, date: '2023-07-18T00:00:00Z', product: 'water' };
   * text = "The price is {{price|number:3.0}} USD, or {{price|number:1.2-4}} starting from {{date|date:dd/MM/yyyy}}, uppercased product: {{product|toUpperCase}}, formatted price: {{price|formatCurrency:USD}}";
   * resolveText(text) => "The price is 012 USD, or 12.56 starting from 18/07/2023, uppercased product: PRODUCT, formatted price: USD 12.57"
   */
  resolveText(text: string): string {
    return text.replace(
      /{{\s*([._a-zA-Z0-9]+)\s*(|\s*([^}:]+)\s*(:\s*[^}]+)?)?\s*}}/g,
      (
        match,
        variableName: string,
        pipeString?: string,
        pipeName?: string,
        pipeArgs?: string
      ) => {
        if (!(variableName in this.variables)) {
          const closestMatch = findClosestMatch(
            variableName,
            Object.keys(this.variables)
          );
          console.error(
            `Variable "${variableName}" not found in template. Did you mean "${closestMatch}"?`
          );
          console.log('Available Variables:\n', this.variables);
          return match; // Return the original placeholder if the variable is not found
        }

        let value = this.variables[variableName];
        if (!pipeString) {
          return String(value);
        }

        pipeName = pipeName?.slice(1).trim();
        if (pipeName?.length === 0) {
          console.warn(
            'You did not provide a pipe name! Variable template: ' + match
          );
          pipeName = undefined;
        }
        pipeArgs = pipeArgs?.slice(1).trim();
        if (!pipeArgs) {
          pipeArgs = '';
        }

        if (!pipeName) {
          return String(value);
        }

        return this.executePipe(pipeName, value, pipeArgs);
      }
    );
  }

  /**
   * Replaces placeholders in the text content of an element and its children with corresponding values from the variables object.
   *
   * Replaces placeholders in the format {{variableName}}, {{variableName:decimalFormat}}, or
   * {{variableName:dateFormat}} in the given text with corresponding values from the `this.variables` object.
   * Supports formatting for both numbers and dates.
   *
   * @param {Element} element - The root element whose text content and children's text content will be processed.
   * @returns {Element} - The element after being processed
   *
   * Placeholders:
   * - {{variableName}}: Replaces with the value of `variableName` from `this.variables`.
   * - {{variableName:decimalFormat}}: Replaces with the formatted value of `variableName`.
   *   - `variableName` should be a number.
   *   - `decimalFormat` specifies the number format in the format 1.2-4.
   *     - 1: minimum integer digits
   *     - 2: minimum fraction digits
   *     - 4: maximum fraction digits
   *
   * - {{variableName:dateFormat}}: Replaces with the formatted value of `variableName`.
   *   - `variableName` should be a date string.
   *   - `dateFormat` specifies the format for the date using yyyy, MM, dd, HH, mm, ss.
   *
   * @param element - The root element whose text content and children's text content will be processed.
   */
  resolveElement(element: Element): Element {
    // Replace placeholders in the text content of ParagraphElement instances
    if (element instanceof ParagraphElement) {
      const filledText = this.resolveText(element.getTextContent());
      element.setTextContent(filledText);
    }

    // Recursively resolve string variables for each child element
    element.children.forEach((child) => this.resolveElement(child));

    return element;
  }

  resolveHeadingJson(elementJson: HeadingElementJson): HeadingElementJson {
    elementJson.text = this.resolveText(elementJson.text);
    return elementJson;
  }

  resolveParagraphJson(
    elementJson: ParagraphElementJson
  ): ParagraphElementJson {
    elementJson.text = this.resolveText(elementJson.text);
    return elementJson;
  }

  resolveTableJson(elementJson: TableElementJson): TableElementJson {
    elementJson.data = elementJson.data.map((row) =>
      row.map((cell: TableCell) => {
        cell.text = this.resolveText(cell.text);
        return cell;
      })
    );
    return elementJson;
  }

  resolveObjectTableJson(
    elementJson: ObjectTableElementJson
  ): ObjectTableElementJson {
    elementJson.data = (
      Array.isArray(elementJson.data) ? elementJson.data : [elementJson.data]
    ).map((record) => {
      return Object.fromEntries(
        Object.entries(record).map(([key, value]) => [
          this.resolveText(key),
          typeof value === 'string' ? this.resolveText(value) : value,
        ])
      ) as DataRecord;
    });
    return elementJson;
  }

  resolveAutoTableJson(
    elementJson: AutoTableElementJson
  ): AutoTableElementJson {
    elementJson.schema = Object.fromEntries(
      Object.entries(elementJson.schema).map(([key, value]) => [
        this.resolveText(key),
        value,
      ])
    );

    return elementJson;
  }
}

function calculateLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = Array.from({ length: len2 + 1 }, (_, i) => [i]);

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      const cost = str1[j - 1] === str2[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len2][len1];
}

// Helper function to find the closest matching key
function findClosestMatch(target: string, available: string[]): string | null {
  let closestStr: string | null = null;
  let minDistance = Infinity;

  for (const str of available) {
    const distance = calculateLevenshteinDistance(target, str);
    if (distance < minDistance) {
      minDistance = distance;
      closestStr = str;
    }
  }

  return closestStr;
}

/**
 * Formats a number to a specified format in the format 1.2-4.
 *
 * @param {number} value - The number to format.
 * @param {string} format - The format specifying the number format in the format 1.2-4.
 * @returns {string} - The formatted number.
 */
function formatNumber(value: number, format: string): string {
  const [minWholeDigits, minFractionDigits, maxFractionDigits] =
    parseNumberFormat(format);

  // Use Number.toFixed to ensure correct rounding behavior
  let formattedValue = value.toFixed(maxFractionDigits);

  // Split the formatted value into whole and fraction parts
  let [wholePart, fractionPart] = formattedValue.split('.');
  wholePart = wholePart.padStart(minWholeDigits, '0');

  // Add commas to the whole part
  wholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  fractionPart = fractionPart || ''; // Ensure fraction part exists
  // Adjust fraction part length
  if (minFractionDigits > fractionPart.length) {
    fractionPart = fractionPart.padEnd(minFractionDigits, '0');
  } else {
    // Remove trailing zeros after minFractionDigits
    while (
      fractionPart.length > minFractionDigits &&
      fractionPart.endsWith('0')
    ) {
      fractionPart = fractionPart.slice(0, -1);
    }
  }

  if (!fractionPart) return wholePart;

  return `${wholePart}.${fractionPart}`;
}

/**
 * Parses a number format string into an array of integers representing minimum whole digits,
 * minimum fraction digits, and maximum fraction digits.
 *
 * @param format - The number format string to parse. Examples: '3.2-4', '1.2-4', '10.5', '2', '1.3'.
 * @returns An array containing [minWholeDigits, minFractionDigits, maxFractionDigits].
 * @throws Error if the format string is invalid.
 */
function parseNumberFormat(format: string): number[] {
  // Regular expression pattern to match the format
  const regex = /^(\d+)\.?(\d+)?-?(\d+)?$/;

  // Extract parts using regex
  const matches = format.match(regex);

  if (!matches) {
    console.error(`Invalid number format: '${format}'`);
    return [1, 0, 100];
  }

  // Parse extracted parts into integers or default to 0 if not present
  const minWholeDigits = parseInt(matches[1]) || 0;
  const minFractionDigits = parseInt(matches[2]) || 0;
  const maxFractionDigits = parseInt(matches[3]) || minFractionDigits;

  // Return an array containing parsed integers
  return [minWholeDigits, minFractionDigits, maxFractionDigits];
}

/**
 * Formats a date string according to the specified format.
 *
 * @param {string} value - The date string to format.
 * @param {string} format - The format string for the date (e.g., yyyy-MM-dd).
 * @returns {string} - The formatted date string.
 */
function formatDate(date: Date, format?: string) {
  if (format) {
    // List of valid placeholders
    const placeholders = ['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss'];

    // Check if format contains at least one valid placeholder
    const containsValidPlaceholder = placeholders.some((ph) =>
      format.includes(ph)
    );
    if (!containsValidPlaceholder) {
      console.error(
        `No valid placeholders found in format string: '${format}'`
      );
      return date.toLocaleDateString(); // Return default locale date string
    }

    const formattedDate = format
      .replace(/yyyy/g, date.getFullYear().toString())
      .replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2))
      .replace(/dd/g, ('0' + date.getDate()).slice(-2))
      .replace(/HH/g, ('0' + date.getHours()).slice(-2))
      .replace(/mm/g, ('0' + date.getMinutes()).slice(-2))
      .replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    return formattedDate;
  }

  // If no format is provided, return the default locale date string
  return date.toLocaleDateString();
}
