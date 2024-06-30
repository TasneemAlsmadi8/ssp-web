import { PDFDocument, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { CustomFont, Element, Style } from './elements/abstract-element';
import { HeadingElement } from './elements/heading-element';
import { ParagraphElement } from './elements/paragraph-element';
import { TableCell, TableElement } from './elements/table-element';
import { HorizontalContainerElement } from './elements/horizontal-container-element';
import { VerticalContainerElement } from './elements/vertical-container-element';

export interface PageOptions {
  height: number;
  width: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  templateUrl?: string;
}

export class PdfBuilder {
  elements: Element[] = [];
  pdfDoc!: PDFDocument;
  private pageOptions: PageOptions;
  private customFonts: CustomFont[] = [];

  constructor(public fileName: string, pageOptions?: Partial<PageOptions>) {
    this.pageOptions = {
      height: 841.89,
      width: 595.28,
      marginTop: 50,
      marginBottom: 50,
      marginLeft: 50,
      marginRight: 50,
    };
    if (pageOptions) this.pageOptions = { ...this.pageOptions, ...pageOptions };
  }

  addCustomFont(customFont: CustomFont) {
    this.customFonts.push(customFont);
    for (const element of this.elements) {
      element.addCustomFont(customFont);
    }
  }

  private applyCustomFonts(element: Element) {
    for (const font of this.customFonts) {
      element.addCustomFont(font);
    }
  }

  createHeading(
    level: number,
    text: string,
    options?: { styles?: Style; standalone?: boolean }
  ): HeadingElement {
    const { styles, standalone } = options ?? {};

    const elem = new HeadingElement(level);
    elem.setTextContent(text);
    if (styles) elem.setStyles(styles);

    if (!standalone) this.elements.push(elem);
    this.applyCustomFonts(elem);
    return elem;
  }
  createParagraph(
    text: string,
    options?: { styles?: Style; standalone?: boolean }
  ): ParagraphElement {
    const { styles, standalone } = options ?? {};

    const elem = new ParagraphElement();
    elem.setTextContent(text);
    if (styles) elem.setStyles(styles);

    if (!standalone) this.elements.push(elem);
    this.applyCustomFonts(elem);
    return elem;
  }

  createTable(
    data: TableCell[][],
    options?: { styles?: Style; standalone?: boolean; cellStyles?: Style }
  ): TableElement {
    const { styles, cellStyles, standalone } = options ?? {};

    const elem = new TableElement();
    for (const row of data) {
      elem.addRow(row);
    }
    if (cellStyles) elem.setCellStyles(cellStyles);
    if (styles) elem.setStyles(styles);

    if (!standalone) this.elements.push(elem);
    this.applyCustomFonts(elem);
    return elem;
  }
  createHorizontalContainer(options?: {
    styles?: Style;
    standalone?: boolean;
  }): HorizontalContainerElement {
    const { styles, standalone } = options ?? {};

    const elem = new HorizontalContainerElement();
    if (styles) elem.setStyles(styles);

    if (!standalone) this.elements.push(elem);
    this.applyCustomFonts(elem);
    return elem;
  }
  async addFontFromUrl(options: {
    name: string;
    fontUrls: { normal: string; bold?: string };
    fromCssFile?: boolean;
  }) {
    const { name, fontUrls, fromCssFile } = options;
    let actualFontUrl = fontUrls;
    if (fromCssFile) {
      // Fetch the CSS file
      const fontCss = await fetch(fontUrls.normal).then((res) => res.text());

      // Extract the actual font URL from the CSS file
      const fontMatch = fontCss.match(/url\((https:\/\/[^)]+)\)/);
      if (!fontMatch) {
        throw new Error('Font URL not found in CSS file');
      }

      actualFontUrl.normal = fontMatch[1];
      if (fontUrls.bold) {
        const fontCss = await fetch(fontUrls.bold).then((res) => res.text());

        // Extract the actual font URL from the CSS file
        const fontMatch = fontCss.match(/url\((https:\/\/[^)]+)\)/);
        if (!fontMatch) {
          throw new Error('Font URL not found in CSS file');
        }

        actualFontUrl.bold = fontMatch[1];
      }
    }

    // Fetch the font data
    const fontNormalArrayBuffer = await fetch(actualFontUrl.normal).then(
      (res) => res.arrayBuffer()
    );
    let fontBoldArrayBuffer;
    if (actualFontUrl.bold)
      fontBoldArrayBuffer = await fetch(actualFontUrl.bold).then((res) =>
        res.arrayBuffer()
      );

    this.addCustomFont({
      name,
      fontBytes: {
        normal: fontNormalArrayBuffer,
        bold: fontBoldArrayBuffer,
      },
    });
  }

  createVerticalContainer(options?: {
    styles?: Style;
    standalone?: boolean;
  }): VerticalContainerElement {
    const { styles, standalone } = options ?? {};

    const elem = new VerticalContainerElement();
    if (styles) elem.setStyles(styles);

    if (!standalone) this.elements.push(elem);
    this.applyCustomFonts(elem);
    return elem;
  }

  createTableFromArrayOfObjects(
    data: Array<{
      [key: string]: string | number | null | undefined;
    }>,
    options?: {
      rowHeaders?: boolean;
      headerStyles?: Style;
      cellStyles?: Style;
      tableStyles?: Style;
      standalone?: boolean;
    }
  ): TableElement {
    const { rowHeaders, headerStyles, cellStyles, tableStyles, standalone } =
      options ?? {};

    const tableData: TableCell[][] = [];

    if (data.length === 0) {
      return this.createTable(tableData, {
        styles: tableStyles,
        cellStyles,
        standalone,
      });
    }

    const keys = Object.keys(data[0]);

    if (rowHeaders) {
      // Add headers as the first row
      const headerRow: TableCell[] = keys.map((key) => ({
        text: key,
        styles: headerStyles,
      }));
      tableData.push(headerRow);

      data.forEach((obj) => {
        const row: TableCell[] = keys.map((key) => ({
          text: obj[key]?.toString() ?? '-',
          styles: cellStyles,
        }));
        tableData.push(row);
      });
    } else {
      // Add headers as the first column
      for (let i = 0; i < keys.length; i++) {
        const row: TableCell[] = [{ text: keys[i], styles: headerStyles }];
        data.forEach((obj) => {
          row.push({
            text: obj[keys[i]]?.toString() ?? '-',
            styles: cellStyles,
          });
        });
        tableData.push(row);
      }
    }

    return this.createTable(tableData, {
      styles: tableStyles,
      cellStyles,
      standalone,
    });
  }

  // createTableFromObject(
  //   obj: {
  //     [key: string]: string | number | null | undefined;
  //   },
  //   options?: {
  //     rowHeaders?: boolean;
  //     headerStyles?: Style;
  //     cellStyles?: Style;
  //     tableStyles?: Style;
  //     standalone?: boolean;
  //   }
  // ): TableElement {
  //   const { rowHeaders, headerStyles, cellStyles, tableStyles, standalone } =
  //     options ?? {};

  //   const data: TableCell[][] = [];
  //   const keys = Object.keys(obj);
  //   const values = Object.values(obj).map((value) => value?.toString() ?? '-');

  //   if (rowHeaders) {
  //     // Add headers as the first row
  //     const headerRow: TableCell[] = keys.map((key) => ({
  //       text: key,
  //       styles: headerStyles,
  //     }));
  //     data.push(headerRow);

  //     const row: TableCell[] = values.map((values) => ({
  //       text: values,
  //       styles: cellStyles,
  //     }));
  //     data.push(row);
  //   } else {
  //     // Add headers as the first column
  //     for (let i = 0; i < keys.length; i++) {
  //       const row: TableCell[] = [
  //         { text: keys[i], styles: headerStyles },
  //         {
  //           text: values[i],
  //           styles: cellStyles,
  //         },
  //       ];
  //       data.push(row);
  //     }
  //   }

  //   return this.createTable(data, {
  //     styles: tableStyles,
  //     cellStyles,
  //     standalone,
  //   });
  // }

  async download(): Promise<void> {
    // Generate the PDF
    const pdfBytes = await this.renderDOMToPDF();

    // Download the PDF
    const blob = this.uint8ArrayToBlob(pdfBytes, 'application/pdf');
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName;
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
    this.pdfDoc.registerFontkit(fontkit);

    const page = await this.addPage();

    let yOffset = this.pageOptions.height - this.pageOptions.marginTop;

    const writableWidth =
      page.getWidth() -
      this.pageOptions.marginLeft -
      this.pageOptions.marginRight;

    for (const element of this.elements) {
      // console.log(this.pageOptions);
      // console.log(writableWidth);
      await element.init(page);
      await element.render({
        x: this.pageOptions.marginLeft,
        y: yOffset,
        maxWidth: writableWidth,
      });
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
