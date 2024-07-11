import { PDFDocument, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Element } from './elements/abstract-element';
import {
  ChildrenStylesSelectors,
  CustomFont,
  ElementStyleCalculator,
} from './elements/element-styles';
import { Style } from './elements/element-styles';
import { HeadingElement } from './elements/heading-element';
import { ParagraphElement } from './elements/paragraph-element';
import { TableCell, TableElement } from './elements/table-element';
import { HorizontalContainerElement } from './elements/horizontal-container-element';
import { VerticalContainerElement } from './elements/vertical-container-element';
import { PageDimensions } from './elements/element-styles';
import { PdfTemplateBuilder } from './pdf-template-builder';

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
  body: VerticalContainerElement;
  private templatePdfBuilder?: PdfTemplateBuilder;
  private pdfDoc!: PDFDocument;
  private pageOptions: PageOptions;

  constructor(
    public fileName: string,
    pageOptions?: Partial<PageOptions>,
    templatePdfBuilder?: PdfTemplateBuilder
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
    if (templatePdfBuilder) this.setTemplatePdfBuilder(templatePdfBuilder);
    this.body = new VerticalContainerElement(this.pageOptions);
  }

  setStyles(styles: Style) {
    this.body.setStyles(styles);
  }

  setTemplatePdfBuilder(value: PdfTemplateBuilder) {
    this.templatePdfBuilder = value;
  }

  addCustomFont(customFont: CustomFont) {
    ElementStyleCalculator.addCustomFont(customFont);
  }

  createHeading(
    level: number,
    text: string,
    options?: { styles?: Style; standalone?: boolean }
  ): HeadingElement {
    const { styles, standalone } = options ?? {};

    const elem = new HeadingElement(this.pageOptions, level);
    elem.setTextContent(text);
    if (styles) elem.setStyles(styles);

    if (!standalone) this.body.addElement(elem);
    return elem;
  }
  createParagraph(
    text: string,
    options?: { styles?: Style; standalone?: boolean }
  ): ParagraphElement {
    const { styles, standalone } = options ?? {};

    const elem = new ParagraphElement(this.pageOptions);
    elem.setTextContent(text);
    if (styles) elem.setStyles(styles);

    if (!standalone) this.body.addElement(elem);
    return elem;
  }

  createTable(
    data: TableCell[][],
    options?: {
      styles?: Style;
      standalone?: boolean;
      cellStyles?: Style;
      rowStyles?: ChildrenStylesSelectors;
      columnStyles?: ChildrenStylesSelectors;
    }
  ): TableElement {
    const { styles, cellStyles, rowStyles, columnStyles, standalone } =
      options ?? {};

    //TODO implement coll styles
    if (columnStyles) console.error('Column styles not implemented yet');

    const elem = new TableElement(this.pageOptions);

    const rowCount = data.length;
    let childrenStyles: Style[] = [];
    if (rowStyles)
      childrenStyles = ElementStyleCalculator.resolveChildrenStyles(
        rowCount,
        rowStyles
      );

    for (let index = 0; index < rowCount; index++) {
      const rowData = data[index];

      if (childrenStyles.length > 0)
        elem.addRow(rowData, childrenStyles[index]);
      else elem.addRow(rowData);
    }
    if (cellStyles) elem.setCellStyles(cellStyles);
    if (styles) elem.setStyles(styles);

    if (!standalone) this.body.addElement(elem);
    return elem;
  }
  createHorizontalContainer(options?: {
    styles?: Style;
    standalone?: boolean;
  }): HorizontalContainerElement {
    const { styles, standalone } = options ?? {};

    const elem = new HorizontalContainerElement(this.pageOptions);
    if (styles) elem.setStyles(styles);

    if (!standalone) this.body.addElement(elem);
    return elem;
  }
  async addFontFromUrl(options: {
    name: string;
    fontUrls: { normal: string; bold?: string };
    fromCssFile?: boolean;
  }) {
    ElementStyleCalculator.addFontFromUrl(options);
  }

  createVerticalContainer(options?: {
    styles?: Style;
    standalone?: boolean;
  }): VerticalContainerElement {
    const { styles, standalone } = options ?? {};

    const elem = new VerticalContainerElement(this.pageOptions);
    if (styles) elem.setStyles(styles);

    if (!standalone) this.body.addElement(elem);
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
      rowStyles?: ChildrenStylesSelectors;
      columnStyles?: ChildrenStylesSelectors;
      styles?: Style;
      standalone?: boolean;
    }
  ): TableElement {
    let {
      rowHeaders,
      headerStyles,
      cellStyles,
      rowStyles,
      columnStyles,
      styles,
      standalone,
    } = options ?? {};

    headerStyles = { ...cellStyles, ...headerStyles };

    const tableData: TableCell[][] = [];

    if (data.length === 0) {
      return this.createTable(tableData, {
        styles,
        cellStyles: headerStyles,
        rowStyles,
        columnStyles,
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
      styles: styles,
      cellStyles,
      rowStyles,
      columnStyles,
      standalone,
    });
  }

  async download(): Promise<void> {
    // Generate the PDF
    await this.renderElementsToPDF();
    const pdfBytes = await this.pdfDoc.save();
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

  protected async renderElementsToPDF(pdfDoc?: PDFDocument, page?: PDFPage) {
    this.pdfDoc = pdfDoc ?? (await PDFDocument.create());
    this.pdfDoc.registerFontkit(fontkit);

    if (!page) page = await this.addPage();

    let yOffset = this.pageOptions.height - this.pageOptions.marginTop;

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
      if (this.templatePdfBuilder)
        await this.templatePdfBuilder.newTemplatePage(this.pdfDoc, page);
      return page;
    }

    const existingPdfBytes = await fetch(this.pageOptions.templateUrl).then(
      (res) => res.arrayBuffer()
    );
    const templatePdfDoc = await PDFDocument.load(existingPdfBytes);

    const [templatePage] = await this.pdfDoc.copyPages(templatePdfDoc, [0]);
    const page = this.pdfDoc.addPage(templatePage);

    if (this.templatePdfBuilder)
      await this.templatePdfBuilder.newTemplatePage(this.pdfDoc, page);
    return page;
  }
}
