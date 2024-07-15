import { Element } from './elements/abstract-element';
import { ParagraphElement } from './elements/paragraph-element';

interface TemplateVariables {
  [key: string]: string | number;
}

export class PdfTemplateResolver {
  private variables: TemplateVariables = {};

  /**
   * Replaces placeholders in the text content of an element and its children with corresponding values from the variables object.
   *
   * Placeholders follow the format ${variableName}, where variableName corresponds to a key in the variables object.
   *
   * @param element - The root element whose text content and children's text content will be processed.
   */
  resolve(element: Element): Element {
    // Replace placeholders in the text content of ParagraphElement instances
    if (element instanceof ParagraphElement) {
      const filledText = this.resolveStringVars(element.getTextContent());
      element.setTextContent(filledText);
    }

    // Recursively resolve string variables for each child element
    element.children.forEach((child) => this.resolve(child));

    return element;
  }

  setVariables(variables: Record<string, string | number>) {
    this.variables = { ...this.variables, ...variables };
  }

  resolveStringVars(template: string): string {
    return template.replace(/\${(\w+)}/g, (match, p1) => {
      return p1 in this.variables ? String(this.variables[p1]) : match;
    });
  }
}
