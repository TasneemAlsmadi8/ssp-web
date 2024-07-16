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

  

  private resolveText(template: string): string {
    return template.replace(/\${(\w+)}/g, (match, p1) => {
      return p1 in this.variables ? String(this.variables[p1]) : match;
    });
  }

  /**
   * Replaces placeholders in the text content of an element and its children with corresponding values from the variables object.
   *
   * Placeholders follow the format ${variableName}, where variableName corresponds to a key in the variables object.
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
