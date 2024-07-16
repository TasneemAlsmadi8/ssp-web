import { Element } from './elements/abstract-element';
import { ParagraphElement } from './elements/paragraph-element';
import {
  DataRecord,
  HeadingElementJson,
  ObjectTableElementJson,
  ParagraphElementJson,
  TableCell,
  TableElementJson,
} from './parser/element-json-types';

interface TemplateVariables {
  [key: string]: string | number;
}

export class PdfTemplateResolver {
  private variables: TemplateVariables = {};

  constructor(variables?: Record<string, string | number>) {
    if (variables) this.setVariables(variables);
  }

  /**
   * Replaces placeholders in the text content of an element and its children with corresponding values from the variables object.
   *
   * Placeholders follow the format ${variableName}, where variableName corresponds to a key in the variables object.
   *
   * @param element - The root element whose text content and children's text content will be processed.
   */

  setVariables(variables: Record<string, string | number>) {
    this.variables = { ...this.variables, ...variables };
  }

  private resolveText(template: string): string {
    return template.replace(/\${(\w+)}/g, (match, p1) => {
      return p1 in this.variables ? String(this.variables[p1]) : match;
    });
  }

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
