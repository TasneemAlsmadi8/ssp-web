import { rgb, StandardFonts, PDFFont } from 'pdf-lib';
import { Style, Element, ComputedStyles, hexToRgb } from './abstract-element';
import { TableCellElement } from './table-cell-element';

export interface TableCell {
  text: string;
  styles?: Style;
}

export interface TableRow {
  cells: TableCellElement[];
  styles?: Style;
}

export class TableElement extends Element {
  rows: TableRow[];
  private cellStyles?: Style;
  constructor() {
    super();
    this.rows = [];
    this.cellStyles = {
      border: 1,
    };
  }

  setCellStyles(styles: Style): void {
    this.cellStyles = { ...this.cellStyles, ...styles };
  }

  getRowHeight(index: number): number {
    if (index >= this.rows.length) {
      throw new Error('Invalid row index');
    }

    const row = this.rows[index].cells;

    return row.reduce(
      (max: number, curr) => (curr.height > max ? curr.height : max),
      row[0].height
    );
  }

  addRow(cells: TableCell[], styles?: Style) {
    const elements: TableCellElement[] = cells.map((value) => {
      const elem = new TableCellElement();
      elem.setTextContent(value.text);
      if (this.cellStyles) elem.setStyles(this.cellStyles);
      if (styles) elem.setStyles(styles);
      if (value.styles) elem.setStyles(value.styles);
      return elem;
    });
    this.rows.push({ cells: elements });
  }

  get innerHeight(): number {
    const padding =
      this.computedStyles.paddingTop + this.computedStyles.paddingBottom;
    const rowHeight = this.computedStyles.fontSize + padding;
    return this.rows.length * rowHeight;
  }
  get innerWidth(): number {
    return (
      this.parentWidth -
      this.computedStyles.marginLeft -
      this.computedStyles.marginRight
    );
  }

  async draw(x: number, y: number) {
    const font: PDFFont = await this.page.doc.embedFont(
      this.computedStyles.font
    );
    // const { fontSize, paddingTop, paddingBottom, color } = this.computedStyles;

    // const cellYPadding = paddingTop + paddingBottom;
    const tableWidth = this.innerWidth;
    const colCount = this.rows[0].cells.length;
    const cellWidth = tableWidth / colCount; // Adjust for table width and column count

    let cursorY = y; // + this.positionAdjustment.textY;

    for (let index = 0; index < this.rows.length; index++) {
      const row = this.rows[index];
      const rowHeight = this.getRowHeight(index);
      let cursorX = x; // + this.positionAdjustment.textY;
      for (const cell of row.cells) {
        cell.render(this.page, cellWidth, cursorX, cursorY);

        cursorX += cellWidth;
      }
      cursorY -= rowHeight;
    }
  }
}
