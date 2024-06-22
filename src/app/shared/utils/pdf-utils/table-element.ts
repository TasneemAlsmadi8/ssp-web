import { rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
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
    const padding = this.styles['padding'] ?? 0;
    const rowHeight = (this.styles['font-size'] ?? 14) + padding * 2;
    return this.rows.length * rowHeight;
  }

  get height(): number {
    const marginTop = this.styles['margin-top'] ?? 0;
    const marginBottom = this.styles['margin-bottom'] ?? 0;
    return this.innerHeight + marginTop + marginBottom;
  }

  async draw(page: PDFPage, x: number, y: number, styles: ComputedStyles) {
    const font: PDFFont = await page.doc.embedFont(StandardFonts.Helvetica);
    const cellPadding = this.styles['padding'] ?? 5;
    const fontSize = this.styles['font-size'] ?? 14;
    const rowHeight = fontSize + cellPadding * 2;

    let cursorY = y;

    const tableWidth = page.getWidth() - 100; // Adjust the table width as needed
    const colCount = this.rows[0].cells.length;
    const cellWidth = tableWidth / colCount;

    for (const row of this.rows) {
      let cursorX = x;
      for (const cell of row.cells) {
        const cellStyles = {
          ...styles,
          ...this.computeCellStyles(cell.styles),
        };

        // Draw background if background color is set
        if (cellStyles.backgroundColor !== rgb(1, 1, 1)) {
          page.drawRectangle({
            x: cursorX,
            y: cursorY - rowHeight,
            width: cellWidth,
            height: rowHeight,
            color: cellStyles.backgroundColor,
          });
        }

        page.drawText(cell.text, {
          x: cursorX + cellPadding,
          y: cursorY - cellPadding - fontSize,
          size: cellStyles.fontSize,
          font,
          color: cellStyles.color,
        });

        page.drawRectangle({
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
    const color = cellStyles['color'] ?? this.styles['color'];
    const backgroundColor =
      cellStyles['background-color'] ?? this.styles['background-color'];
    return {
      fontSize: cellStyles['font-size'] ?? this.styles['font-size'],
      color: color ? hexToRgb(color) : undefined,
      backgroundColor: backgroundColor ? hexToRgb(backgroundColor) : undefined,
      padding: cellStyles['padding'] ?? this.styles['padding'],
    };
  }
}
