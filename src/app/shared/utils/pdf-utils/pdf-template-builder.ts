import { PDFDocument, PDFPage } from 'pdf-lib';
import { PageOptions, PdfBuilder } from './pdf-builder';
import { Style } from './elements/element-styles';
import { HeadingElement } from './elements/heading-element';
import { ParagraphElement } from './elements/paragraph-element';

interface TemplateVariables {
  [key: string]: string | number;
  date: string;
  pageNumber: number;
  totalPages: number;
}

export class PdfTemplateBuilder extends PdfBuilder {
  private variables: TemplateVariables = {
    date: new Date().toDateString(),
    pageNumber: 1,
    totalPages: 1,
  };

  constructor(
    fileName: string = 'template.pdf',
    pageOptions?: Partial<PageOptions>
  ) {
    super(fileName, pageOptions);
  }

  async newTemplatePage(pdfDoc: PDFDocument, page: PDFPage) {
    this.variables.pageNumber++;
    await this.renderElementsToPDF(pdfDoc, page);
  }

  override createHeading(
    level: number,
    text: string,
    _options?: { styles?: Style; standalone?: boolean }
  ): HeadingElement {
    text = this.fillTemplate(text);
    return super.createHeading(level, text, _options);
  }

  override createParagraph(
    text: string,
    _options?: { styles?: Style; standalone?: boolean }
  ): ParagraphElement {
    text = this.fillTemplate(text);
    return super.createParagraph(text, _options);
  }

  /**
   * Replaces placeholders in the template string with corresponding values from the variables object.
   *
   * The placeholders are in the format ${variableName}, where variableName corresponds to a key in the variables object.
   *
   * @param template - The template string containing placeholders.
   * @returns The template string with placeholders replaced by their respective values.
   */
  fillTemplate(template: string): string {
    return template.replace(/\${(\w+)}/g, (match, p1) => {
      return p1 in this.variables ? String(this.variables[p1]) : match;
    });
  }

  addVariables(variables: { [key: string]: string | number }) {
    this.variables = { ...this.variables, ...variables };
  }
}
