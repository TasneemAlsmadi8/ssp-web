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

interface TemplateVariables {
  [key: string]: string | number;
}

export class PdfTemplateResolver {
  private variables: DataRecord = {};

  constructor(variables?: ComplexDataRecord) {
    if (variables) this.setVariables(variables);
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

  resolveText(text: string): string {
    return text.replace(/{{((\w|[.])+)}}/g, (match, variableName) => {
      if (variableName in this.variables) {
        return String(this.variables[variableName]);
      } else {
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
    });
  }

  /**
   * Replaces placeholders in the text content of an element and its children with corresponding values from the variables object.
   *
   * Placeholders follow the format {{variableName}}, where variableName corresponds to a key in the variables object.
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
