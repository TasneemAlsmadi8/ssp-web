import { PDFDocument, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Element } from './elements/abstract-element';
import { CustomFont, ElementStyleCalculator } from './elements/element-styles';
import { Style } from './elements/element-styles';
import { VerticalContainerElement } from './elements/vertical-container-element';
import { PageDimensions } from './elements/element-styles';
import { PdfTemplateResolver } from './pdf-template-resolver';

export interface PageMargins {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export interface PageOptions extends PageDimensions, PageMargins {
  templateUrl?: string;
  landscape?: true;
}

export class PdfBuilder {
  private body: VerticalContainerElement;
  private pdfDoc!: PDFDocument;
  private pageOptions: PageOptions;
  private pdfTemplateResolver = new PdfTemplateResolver();

  constructor(
    public fileName: string,
    pageOptions?: Partial<PageOptions>,
    private pageTemplateBuilder?: PdfBuilder
  ) {
    this.pageOptions = {
      height: 841.89,
      width: 595.28,
      marginTop: 50,
      marginBottom: 50,
      marginLeft: 50,
      marginRight: 50,
    };
    if (pageOptions) this.pageOptions = { ...this.pageOptions, ...pageOptions };
    if (
      pageOptions?.landscape &&
      this.pageOptions.height > this.pageOptions.width
    ) {
      [this.pageOptions.width, this.pageOptions.height] = [
        this.pageOptions.height,
        this.pageOptions.width,
      ];
    }
    this.body = new VerticalContainerElement(this.pageOptions);
  }

  setStyles(styles: Style) {
    this.body.setStyles(styles);
  }

  setTemplatePdfBuilder(value: PdfBuilder) {
    this.pageTemplateBuilder = value;
  }

  async addFontFromUrl(options: {
    name: string;
    fontUrls: { normal: string; bold?: string };
    fromCssFile?: boolean;
  }) {
    await ElementStyleCalculator.addFontFromUrl(options);
  }

  addCustomFont(customFont: CustomFont) {
    ElementStyleCalculator.addCustomFont(customFont);
  }

  setVariables(variables: { [key: string]: string | number }) {
    this.pdfTemplateResolver.setVariables(variables);
  }

  addElement(element: Element): void {
    this.body.addElement(element);
  }

  async getPdfBase64(): Promise<string> {
    await this.renderElementsToPDF();
    return await this.pdfDoc.saveAsBase64();
  }

  async getPdfBlob(): Promise<Blob> {
    await this.renderElementsToPDF();
    const pdfBytes = await this.pdfDoc.save();
    return this.uint8ArrayToBlob(pdfBytes, 'application/pdf');
  }

  // async download(): Promise<void> {
  //   // Generate the PDF
  //   await this.renderElementsToPDF();
  //   const pdfBytes = await this.pdfDoc.save();
  //   // Download the PDF
  //   const blob = this.uint8ArrayToBlob(pdfBytes, 'application/pdf');
  //   const url = window.URL.createObjectURL(blob);

  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = this.fileName;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   window.URL.revokeObjectURL(url);
  // }

  private async renderElementsToPDF(pdfDoc?: PDFDocument, page?: PDFPage) {
    this.pdfDoc = pdfDoc ?? (await PDFDocument.create());
    if (!pdfDoc) this.pdfDoc.registerFontkit(fontkit);

    if (!page) page = await this.addPage();

    let yOffset = this.pageOptions.height - this.pageOptions.marginTop;

    this.pdfTemplateResolver.resolve(this.body);

    const writableWidth =
      page.getWidth() -
      this.pageOptions.marginLeft -
      this.pageOptions.marginRight;

    await this.body.init(page);
    await this.body.render({
      x: this.pageOptions.marginLeft,
      y: yOffset,
      maxWidth: writableWidth,
    });

    await this.renderTemplatePages();
  }

  private async renderTemplatePages() {
    let pageNumber = 1;
    const totalPages = this.pdfDoc.getPages().length;
    for (const page of this.pdfDoc.getPages()) {
      this.pageTemplateBuilder?.setVariables({
        pageNumber,
        totalPages,
      });
      this.pageTemplateBuilder?.renderElementsToPDF(this.pdfDoc, page);

      pageNumber++;
    }
  }

  private uint8ArrayToBlob(array: Uint8Array, contentType: string): Blob {
    return new Blob([array], { type: contentType });
  }

  private async addPage(): Promise<PDFPage> {
    if (!this.pageOptions.templateUrl) {
      const page = this.pdfDoc.addPage([
        this.pageOptions.width,
        this.pageOptions.height,
      ]);
      return page;
    }

    const existingPdfBytes = await fetch(this.pageOptions.templateUrl).then(
      (res) => res.arrayBuffer()
    );
    const templatePdfDoc = await PDFDocument.load(existingPdfBytes);

    const [templatePage] = await this.pdfDoc.copyPages(templatePdfDoc, [0]);
    const page = this.pdfDoc.addPage(templatePage);

    return page;
  }
}
