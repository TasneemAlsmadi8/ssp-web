import { PDFDocument, PDFPage } from 'pdf-lib';
import { Element, Style } from './abstract-element';
import { HeadingElement } from './heading-element';
import { ParagraphElement } from './paragraph-element';
import { TableCell, TableElement } from './table-element';

export interface PageOptions {
  height: number;
  width: number;
  marginTop: number;
  marginLeft: number;
  templateUrl?: string;
}

export class PdfBuilder {
  elements: Element[] = [];
  pdfDoc!: PDFDocument;

  constructor(
    private pageOptions: PageOptions = {
      height: 841.89,
      width: 595.28,
      marginTop: 50,
      marginLeft: 50,
    }
  ) {}

  createHeading(level: number, text?: string, styles?: Style): Element {
    const elem = new HeadingElement(level);
    this.elements.push(elem);
    if (text) elem.setTextContent(text);
    for (const style in styles) {
      const value = styles[style];
      if (value) elem.setStyle(style, value);
    }
    return elem;
  }
  createParagraph(text?: string, styles?: Style): Element {
    const elem = new ParagraphElement();
    this.elements.push(elem);

    if (text) elem.setTextContent(text);
    for (const style in styles) {
      const value = styles[style];
      if (value) elem.setStyle(style, value);
    }
    return elem;
  }

  createTable(data: TableCell[][], styles?: Style): TableElement {
    const elem = new TableElement();
    this.elements.push(elem);
    for (const row of data) {
      elem.addRow(row);
    }
    if (styles) {
      for (const style in styles) {
        const value = styles[style];
        if (value) elem.setStyle(style, value);
      }
    }
    return elem;
  }

  async download(): Promise<void> {
    // Generate the PDF
    const pdfBytes = await this.renderDOMToPDF();

    // Download the PDF
    const blob = this.uint8ArrayToBlob(pdfBytes, 'application/pdf');
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private async renderDOMToPDF(): Promise<Uint8Array> {
    // const url = '/assets/ABS Report Template.pdf';
    // const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    // const pdfDoc = await PDFDocument.load(existingPdfBytes);
    // // const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // const pages = pdfDoc.getPages();
    // const page = pages[0];

    this.pdfDoc = await PDFDocument.create();
    const page = await this.addPage();

    let yOffset = this.pageOptions.height - this.pageOptions.marginTop;

    for (const element of this.elements) {
      const styles = element.computeStyles();
      await element.draw(page, 50, yOffset, styles);
      yOffset -= element.height; // Adjust spacing
    }

    return this.pdfDoc.save();
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
