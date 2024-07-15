import { PDFDocument, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Element } from './elements/abstract-element';
import { CustomFont, ElementStyleCalculator } from './elements/element-styles';
import { Style } from './elements/element-styles';
import { VerticalContainerElement } from './elements/vertical-container-element';
import { PdfTemplateResolver } from './pdf-template-resolver';
import { PageOptions } from './elements/element-styles';

export class PdfBuilder {
  private body: VerticalContainerElement;
  private pdfDoc!: PDFDocument;
  private pageOptions: PageOptions;
  private pdfTemplateResolver = new PdfTemplateResolver();
  private pageTemplateBuilder?: PdfBuilder;

  isReusableTemplate = false;

  constructor(
    public fileName: string,
    pageOptions?: Partial<PageOptions>,
    pageTemplateBuilder?: PdfBuilder
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

    if (pageTemplateBuilder) this.setTemplatePdfBuilder(pageTemplateBuilder);
    this.body = new VerticalContainerElement(this.pageOptions);
  }

  setStyles(styles: Style) {
    this.body.setStyles(styles);
  }

  setTemplatePdfBuilder(value: PdfBuilder) {
    this.pageTemplateBuilder = value;
    this.pageTemplateBuilder.isReusableTemplate = true;
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

    const resolvedBody = this.pdfTemplateResolver.resolve(
      this.isReusableTemplate ? this.body.clone() : this.body
    );

    const writableWidth =
      page.getWidth() -
      this.pageOptions.marginLeft -
      this.pageOptions.marginRight;

    await resolvedBody.init(page, this.addPage.bind(this));
    await resolvedBody.render({
      x: this.pageOptions.marginLeft,
      y: yOffset,
      maxWidth: writableWidth,
    });

    if (this.pageTemplateBuilder) await this.renderTemplatePages();
  }

  private async renderTemplatePages() {
    let pageNumber = 1;
    const pages = this.pdfDoc.getPages();
    const totalPages = pages.length;
    for (const page of pages) {
      this.pageTemplateBuilder!.setVariables({
        pageNumber,
        totalPages,
      });
      await this.pageTemplateBuilder!.renderElementsToPDF(this.pdfDoc, page);

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
