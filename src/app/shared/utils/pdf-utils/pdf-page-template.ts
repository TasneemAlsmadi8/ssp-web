import { PDFDocument } from 'pdf-lib';
import { PdfBuilder } from './pdf-builder';
import { PdfTemplateResolver } from './parser/pdf-template-resolver';
import { ComplexDataRecord } from './parser/element-json-types';

export class PdfPageTemplateBuilder extends PdfBuilder {
  private pdfTemplateResolver = new PdfTemplateResolver();
  setVariables(variables: ComplexDataRecord) {
    this.pdfTemplateResolver.setVariables(variables);
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
      this.pdfTemplateResolver.resolveElement(this.body);
      await this.renderElementsToPDF(page);

      this.body = bodyWithTemplates;
      pageNumber++;
    }
  }
}
