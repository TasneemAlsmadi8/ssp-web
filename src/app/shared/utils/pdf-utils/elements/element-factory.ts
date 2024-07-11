import {
  Style,
  PageDimensions,
  ElementStyleCalculator,
  ChildrenStylesSelectors,
} from './element-styles';
import { HeadingElement } from './heading-element';
import { ParagraphElement } from './paragraph-element';
import { TableCell, TableElement } from './table-element';
import { HorizontalContainerElement } from './horizontal-container-element';
import { VerticalContainerElement } from './vertical-container-element';

export class ElementFactory {
  private pageDimensions: PageDimensions;

  constructor(
    pageDimensions: Partial<PageDimensions> = {
      height: 841.89,
      width: 595.28,
    }
  ) {
    this.pageDimensions = {
      height: 841.89,
      width: 595.28,
    };
    if (pageDimensions)
      this.pageDimensions = { ...this.pageDimensions, ...pageDimensions };
  }

  createHeading(
    level: number,
    text: string,
    options?: { styles?: Style }
  ): HeadingElement {
    const { styles } = options ?? {};

    const elem = new HeadingElement(this.pageDimensions, level);
    elem.setTextContent(text);
    if (styles) elem.setStyles(styles);

    return elem;
  }
  createParagraph(
    text: string,
    options?: { styles?: Style }
  ): ParagraphElement {
    const { styles } = options ?? {};

    const elem = new ParagraphElement(this.pageDimensions);
    elem.setTextContent(text);
    if (styles) elem.setStyles(styles);

    return elem;
  }

  createTable(
    data: TableCell[][],
    options?: {
      styles?: Style;

      cellStyles?: Style;
      rowStyles?: ChildrenStylesSelectors;
      columnStyles?: ChildrenStylesSelectors;
    }
  ): TableElement {
    const { styles, cellStyles, rowStyles, columnStyles } = options ?? {};

    //TODO implement coll styles
    if (columnStyles) console.error('Column styles not implemented yet');

    const elem = new TableElement(this.pageDimensions);

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

    return elem;
  }
  createHorizontalContainer(options?: {
    styles?: Style;
  }): HorizontalContainerElement {
    const { styles } = options ?? {};

    const elem = new HorizontalContainerElement(this.pageDimensions);
    if (styles) elem.setStyles(styles);

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
  }): VerticalContainerElement {
    const { styles } = options ?? {};

    const elem = new VerticalContainerElement(this.pageDimensions);
    if (styles) elem.setStyles(styles);

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
    }
  ): TableElement {
    let {
      rowHeaders,
      headerStyles,
      cellStyles,
      rowStyles,
      columnStyles,
      styles,
    } = options ?? {};

    headerStyles = { ...cellStyles, ...headerStyles };

    const tableData: TableCell[][] = [];

    if (data.length === 0) {
      return this.createTable(tableData, {
        styles,
        cellStyles: headerStyles,
        rowStyles,
        columnStyles,
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
    });
  }
}
