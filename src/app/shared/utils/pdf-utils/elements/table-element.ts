import { ParentElement } from './abstract-element';
import { Element } from './abstract-element';
import { PageDimensions, Style } from './element-styles';
import { TableCellElement } from './table-cell-element';

export interface TableCell {
  text: string;
  styles?: Style;
}

export interface TableRow {
  cells: TableCellElement[];
  styles?: Style;
}

export class TableElement extends Element implements ParentElement {
  rows: TableRow[];
  private cellStyles?: Style;
  constructor(pageDimensions: PageDimensions) {
    super(pageDimensions);
    this.rows = [];
    this.cellStyles = {
      border: 1,
    };
  }

  override get children(): TableCellElement[] {
    return this.rows.flatMap((value) => value.cells);
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
      row[0]?.height
    );
  }

  addRow(cells: TableCell[], styles?: Style) {
    const elements: TableCellElement[] = cells.map((value) => {
      const elem = new TableCellElement(this.pageDimensions);
      elem.setTextContent(value.text);
      if (this.cellStyles) elem.setStyles(this.cellStyles);
      if (styles) elem.setStyles(styles);
      if (value.styles) elem.setStyles(value.styles);
      return elem;
    });
    this.rows.push({ cells: elements });
  }

  get contentHeight(): number {
    let result = 0;
    for (let i = 0; i < this.rows.length; i++) {
      result += this.getRowHeight(i);
    }
    return result;
  }
  get contentWidth(): number {
    return (
      this.maxWidth -
      this.computedStyles.paddingLeft -
      this.computedStyles.paddingRight -
      this.computedStyles.marginLeft -
      this.computedStyles.marginRight
    );
  }

  async draw() {
    const tableWidth = this.contentWidth;
    const colCount = this.rows[0].cells.length;
    const cellWidth = tableWidth / colCount; // Adjust for table width and column count

    let cursorY = this.position.y + this.positionAdjustment.contentY; //+ this.contentHeight;

    for (let index = 0; index < this.rows.length; index++) {
      const row = this.rows[index];
      for (const cell of row.cells) {
        await cell.preRender({ maxWidth: cellWidth });
      }
      const rowHeight = this.getRowHeight(index);
      let cursorX = this.position.x + this.positionAdjustment.contentX;
      for (const cell of row.cells) {
        cell.setHeight(rowHeight);
        await cell.render({ x: cursorX, y: cursorY });
        cursorX += cellWidth;
      }
      cursorY -= rowHeight;
    }
  }
}
