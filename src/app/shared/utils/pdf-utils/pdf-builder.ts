import { PDFDocument, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Element } from './elements/abstract-element';
import { CustomFont, ElementStyleCalculator } from './elements/element-styles';
import { Style } from './elements/element-styles';
import { VerticalContainerElement } from './elements/vertical-container-element';
import { PageOptions } from './elements/element-styles';
import { PdfPageTemplateBuilder } from './pdf-page-template';

export class PdfBuilder {
  protected body: VerticalContainerElement;
  private pdfDoc!: PDFDocument;
  private pageOptions: PageOptions;

  constructor(
    public fileName: string,
    pageOptions?: Partial<PageOptions>,
    private pageTemplateBuilder?: PdfPageTemplateBuilder
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
      pageOptions?.pageOrientation === 'landscape' &&
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

  setTemplatePdfBuilder(value: PdfPageTemplateBuilder) {
    this.pageTemplateBuilder = value;
  }

  async addFontFromUrl(options: {
    name: string;
    fontUrls: { normal: string; bold?: string };
    fromCssFile?: boolean;
  }): Promise<void> {
    await ElementStyleCalculator.addFontFromUrl(options);
  }

  addCustomFont(customFont: CustomFont) {
    ElementStyleCalculator.addCustomFont(customFont);
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

  protected async renderElementsToPDF(page?: PDFPage) {
    this.pdfDoc = page?.doc ?? (await PDFDocument.create());

    if (!page) {
      this.pdfDoc.registerFontkit(fontkit);
      this.pdfDoc.setTitle(this.fileName, { showInWindowTitleBar: true });

      page = await this.addPage();
    }

    let yOffset = this.pageOptions.height - this.pageOptions.marginTop;

    const writableWidth =
      page.getWidth() -
      this.pageOptions.marginLeft -
      this.pageOptions.marginRight;

    await this.body.init(page, this.addPage.bind(this));
    this.body.preRender({
      x: this.pageOptions.marginLeft,
      y: yOffset,
      maxWidth: writableWidth,
    });
    await this.body.render();

    if (this.pageTemplateBuilder)
      await this.pageTemplateBuilder.renderTemplatePages(this.pdfDoc);
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
