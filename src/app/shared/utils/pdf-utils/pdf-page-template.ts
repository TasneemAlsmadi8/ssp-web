import { PDFDocument } from 'pdf-lib';
import { PdfBuilder } from './pdf-builder';
import { PdfVariableResolver } from './parser/pdf-variable-resolver';
import { ComplexDataRecord } from './parser/element-json-types';

export class PdfPageTemplateBuilder extends PdfBuilder {
  private pdfVariableResolver = new PdfVariableResolver();
  setVariables(variables: ComplexDataRecord) {
    this.pdfVariableResolver.setVariables(variables);
  }
  async renderTemplatePages(pdfDoc: PDFDocument) {
    let pageNumber = 1;
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    const bodyWithTemplates = this.body.clone();
    for (const page of pages) {
      this.setVariables({
        pageNumber,
        totalPages,
      });
      this.pdfVariableResolver.resolveElement(this.body);
      await this.renderElementsToPDF(page);

      this.body = bodyWithTemplates;
      pageNumber++;
    }
  }
}
