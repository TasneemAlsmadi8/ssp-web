import { PDFDocument } from 'pdf-lib';
import { PdfBuilder } from './pdf-builder';
import { PdfTemplateResolver } from './pdf-template-resolver';

export class PdfPageTemplateBuilder extends PdfBuilder {
  private pdfTemplateResolver = new PdfTemplateResolver();
  setVariables(variables: Record<string, string | number>) {
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
      this.pdfTemplateResolver.resolve(this.body);
      await this.renderElementsToPDF(page);

      this.body = bodyWithTemplates;
      pageNumber++;
    }
  }
}
