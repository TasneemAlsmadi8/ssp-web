import {
  Style,
  PageDimensions,
  ElementStyleCalculator,
  ChildrenStylesSelectors,
  PageOptions,
} from './element-styles';
import { HeadingElement } from './heading-element';
import { ParagraphElement } from './paragraph-element';
import { TableCell, TableElement } from './table-element';
import { HorizontalContainerElement } from './horizontal-container-element';
import { VerticalContainerElement } from './vertical-container-element';
import { DataRecord } from '../parser/element-json-types';

export class ElementFactory {
  private pageOptions: PageOptions;

  constructor(
    pageDimensions: Partial<PageDimensions> = {
      height: 841.89,
      width: 595.28,
    }
  ) {
    this.pageOptions = {
      height: 841.89,
      width: 595.28,
      marginTop: 50,
      marginBottom: 50,
      marginLeft: 50,
      marginRight: 50,
    };
    if (pageDimensions)
      this.pageOptions = { ...this.pageOptions, ...pageDimensions };
  }

  createHeading(
    level: number,
    text: string,
    options?: { styles?: Style }
  ): HeadingElement {
    const { styles } = options ?? {};

    const elem = new HeadingElement(this.pageOptions, level);
    elem.setTextContent(text);
    if (styles) elem.setStyles(styles);

    return elem;
  }

  createParagraph(
    text: string,
    options?: { styles?: Style }
  ): ParagraphElement {
    const { styles } = options ?? {};

    const elem = new ParagraphElement(this.pageOptions);
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
      columnsRatio?: number[];
    }
  ): TableElement {
    const { styles, cellStyles, rowStyles, columnStyles, columnsRatio } =
      options ?? {};

    const elem = new TableElement(this.pageOptions);

    const rowCount = data.length;
    const colCount = data?.at(0)?.length ?? 0;

    let resolvedRowStyles: Style[] | undefined;
    if (rowStyles)
      resolvedRowStyles = ElementStyleCalculator.resolveChildrenStyles(
        rowCount,
        rowStyles
      );
    let resolvedColumnStyles: Style[] | undefined;
    if (columnStyles)
      resolvedColumnStyles = ElementStyleCalculator.resolveChildrenStyles(
        colCount,
        columnStyles
      );

    for (let index = 0; index < rowCount; index++) {
      const rowData = data[index];

      elem.addRow(rowData, resolvedRowStyles?.[index], resolvedColumnStyles);
    }
    if (cellStyles) elem.setCellStyles(cellStyles);
    if (styles) elem.setStyles(styles);
    if (columnsRatio) elem.setColumnsRatio(columnsRatio);

    return elem;
  }

  createHorizontalContainer(options?: {
    styles?: Style;
  }): HorizontalContainerElement {
    const { styles } = options ?? {};

    const elem = new HorizontalContainerElement(this.pageOptions);
    if (styles) elem.setStyles(styles);

    return elem;
  }

  createVerticalContainer(options?: {
    styles?: Style;
  }): VerticalContainerElement {
    const { styles } = options ?? {};

    const elem = new VerticalContainerElement(this.pageOptions);
    if (styles) elem.setStyles(styles);

    return elem;
  }

  createTableFromArrayOfObjects(
    data: Array<DataRecord>,
    options?: {
      headersPlacement?: 'row' | 'column';
      hideHeaders?: boolean;
      headerStyles?: Style;
      cellStyles?: Style;
      rowStyles?: ChildrenStylesSelectors;
      columnStyles?: ChildrenStylesSelectors;
      styles?: Style;
      columnsRatio?: number[];
    }
  ): TableElement {
    let {
      headersPlacement,
      hideHeaders,
      headerStyles,
      cellStyles,
      rowStyles,
      columnStyles,
      styles,
      columnsRatio,
    } = options ?? {};

    headerStyles = { ...cellStyles, ...headerStyles };

    const tableData: TableCell[][] = [];

    if (data.length === 0) {
      return this.createTable(tableData, {
        styles,
        cellStyles: headerStyles,
        rowStyles,
        columnStyles,
        columnsRatio,
      });
    }

    const keys = Object.keys(data[0]);

    if (headersPlacement === 'row' || headersPlacement === undefined) {
      // Add headers as the first row
      const headerRow: TableCell[] = keys.map((key) => ({
        text: key,
        styles: headerStyles,
      }));
      if (!hideHeaders) tableData.push(headerRow);

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
        const row: TableCell[] = [];
        if (!hideHeaders) row.push({ text: keys[i], styles: headerStyles });
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
      columnsRatio,
    });
  }
}
