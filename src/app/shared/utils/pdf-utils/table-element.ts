import { rgb, StandardFonts, PDFFont } from 'pdf-lib';
import { Style, Element, ComputedStyles, hexToRgb } from './abstract-element';

export interface TableCell {
  text: string;
  styles?: Style;
}

export interface TableRow {
  cells: TableCell[];
}

export class TableElement extends Element {
  rows: TableRow[];

  constructor() {
    super();
    this.rows = [];
  }

  addRow(cells: TableCell[]) {
    this.rows.push({ cells });
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
      StandardFonts.Helvetica
    );
    const { fontSize, paddingTop, paddingBottom, color } = this.computedStyles;

    const cellYPadding = paddingTop + paddingBottom;
    const rowHeight = fontSize + cellYPadding; // Adjust for cell padding
    const tableWidth = this.innerWidth;
    const colCount = this.rows[0].cells.length;
    const cellWidth = tableWidth / colCount; // Adjust for table width and column count

    let cursorY = y;

    for (const row of this.rows) {
      let cursorX = x;
      for (const cell of row.cells) {
        const cellStyles = this.computeCellStyles(cell.styles);
        const {
          fontSize: cellFontSize = fontSize,
          paddingLeft = 0,
          paddingRight = 0,
          paddingTop: cellPaddingTop = 0,
          paddingBottom: cellPaddingBottom = 0,
          color: cellColor = color,
        } = cellStyles;

        this.page.drawText(cell.text, {
          x: cursorX + paddingLeft,
          y: cursorY - cellPaddingTop - cellFontSize,
          size: cellFontSize,
          font,
          color: cellColor,
        });

        this.page.drawRectangle({
          x: cursorX,
          y: cursorY - rowHeight,
          width: cellWidth,
          height: rowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        cursorX += cellWidth;
      }
      cursorY -= rowHeight;
    }
  }

  private computeCellStyles(cellStyles?: Style): Partial<ComputedStyles> {
    if (!cellStyles) return {};
    const color = cellStyles['color']
      ? hexToRgb(cellStyles['color'])
      : this.computedStyles.color;
    const backgroundColor = cellStyles['background-color']
      ? hexToRgb(cellStyles['background-color'])
      : this.computedStyles.backgroundColor;
    const computedPaddingTop =
      cellStyles['padding-top'] ??
      cellStyles.padding ??
      this.computedStyles.paddingTop;
    const computedPaddingRight =
      cellStyles['padding-right'] ??
      cellStyles.padding ??
      this.computedStyles.paddingRight;
    const computedPaddingBottom =
      cellStyles['padding-bottom'] ??
      cellStyles.padding ??
      this.computedStyles.paddingBottom;
    const computedPaddingLeft =
      cellStyles['padding-left'] ??
      cellStyles.padding ??
      this.computedStyles.paddingLeft;

    return {
      fontSize: cellStyles['font-size'] ?? this.computedStyles.fontSize,
      color: color,
      backgroundColor: backgroundColor,
      paddingTop: computedPaddingTop,
      paddingRight: computedPaddingRight,
      paddingBottom: computedPaddingBottom,
      paddingLeft: computedPaddingLeft,
    };
  }
}
