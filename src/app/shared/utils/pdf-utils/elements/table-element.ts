import { ParentElement } from './abstract-element';
import { Element } from './abstract-element';
import { PageOptions, Style } from './element-styles';
import { TableCellElement } from './table-cell-element';

export interface TableCell {
  text: string;
  styles?: Style;
}

export class TableRow {
  constructor(public cells: TableCellElement[], styles?: Style) {
    if (styles) this.addStyles(styles);
  }
  addStyles(styles: Style) {
    this.cells.forEach((value) => {
      const oldStyles = value.styles;
      value.setStyles(styles);
      value.setStyles(oldStyles);
    });
  }
}

export class TableElement extends Element implements ParentElement {
  rows: TableRow[];
  columnsRatio!: number[];
  private cellStyles?: Style;
  constructor(pageOptions: PageOptions) {
    super(pageOptions);
    this.rows = [];
    this.cellStyles = {
      border: 1,
    };
  }

  override get children(): TableCellElement[] {
    return this.rows.flatMap((value) => value.cells);
  }

  setColumnRatio(index: number, ratio: number) {
    if (this.rows.length === 0 || !this.columnsRatio)
      throw new Error(
        'Please use addRow() to set rows before specifying columns ratio'
      );
    if (index < 0 || index >= this.rows[0].cells.length)
      throw new Error(
        `Invalid column index. column index must be > 0 and < ${this.rows[0].cells.length}`
      );

    this.columnsRatio[index] = ratio;
  }
  setColumnsRatio(ratios: number[]) {
    if (this.rows.length === 0 || !this.columnsRatio)
      throw new Error(
        'Please use addRow() to set rows before specifying columns ratio'
      );

    ratios.forEach((value, index) => (this.columnsRatio[index] = value));
  }

  setCellStyles(styles: Style): void {
    this.cellStyles = { ...this.cellStyles, ...styles };
  }

  getRowHeight(index: number): number {
    if (index >= this.rows.length || index < 0) {
      throw new Error('Invalid row index');
    }

    const row = this.rows[index].cells;

    return row.reduce(
      (max: number, curr) => (curr.height > max ? curr.height : max),
      row[0]?.height
    );
  }

  addRow(cells: TableCell[], rowStyles?: Style, columnStyles?: Style[]) {
    if (!this.columnsRatio) {
      this.columnsRatio = new Array(cells.length).fill(1);
    }

    const elements: TableCellElement[] = cells.map((value, index) => {
      const elem = new TableCellElement(this.pageOptions);
      elem.setTextContent(value.text);
      if (this.cellStyles) elem.setStyles(this.cellStyles);
      if (columnStyles) elem.setStyles(columnStyles[index]);
      if (rowStyles) elem.setStyles(rowStyles);
      if (value.styles) elem.setStyles(value.styles);
      return elem;
    });
    this.rows.push(new TableRow(elements));
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

  @Element.UseFallbackFont
  override preRenderDimensions(args: { maxWidth: number }): void {
    super.preRenderDimensions(args);
    if (this.rows.length === 0) return;

    const tableWidth = this.contentWidth;
    const totalColsWeight = this.columnsRatio.reduce(
      (sum, value) => sum + value,
      0
    );
    const columnWidthPerRatioUnit = tableWidth / totalColsWeight; // Adjust for table width and column count

    for (let index = 0; index < this.rows.length; index++) {
      const row = this.rows[index];
      for (let columnIndex = 0; columnIndex < row.cells.length; columnIndex++) {
        const cell = row.cells[columnIndex];
        if (!this.columnsRatio || this.columnsRatio.length === 0) debugger;
        const columnWidth =
          columnWidthPerRatioUnit * this.columnsRatio[columnIndex];
        cell.preRenderDimensions({ maxWidth: columnWidth });
      }
    }
  }

  @Element.UseFallbackFont
  override preRenderPosition(position: { x: number; y: number }): void {
    super.preRenderPosition(position);
    let cursorY = this.position.y + this.positionAdjustment.contentY; //+ this.contentHeight;
    for (let index = 0; index < this.rows.length; index++) {
      const row = this.rows[index];
      const rowHeight = this.getRowHeight(index);
      let cursorX = this.position.x + this.positionAdjustment.contentX;
      for (const cell of row.cells) {
        cell.setHeight(rowHeight, true);
        cell.preRenderPosition({ x: cursorX, y: cursorY });
        cursorX += cell.width;
      }
      cursorY -= rowHeight;
    }
  }

  async draw() {
    if (this.rows.length === 0) return;
    for (const row of this.rows) {
      for (const cell of row.cells) {
        await cell.render();
      }
    }
  }

  override clone(): TableElement {
    const cloned = super.clone() as TableElement;
    cloned.rows = this.rows.map((row) => {
      const clonedCells = row.cells.map((cell) => cell.clone());
      return new TableRow(clonedCells);
    });
    cloned.cellStyles = { ...this.cellStyles };
    return cloned;
  }

  protected override async splitElementOnOverflow({
    availableHeight,
    clone,
  }: {
    availableHeight: number;
    clone: Element;
  }): Promise<Element> {
    const cloneRows: TableRow[] = [];

    while (this.contentHeight > availableHeight) {
      cloneRows.unshift(this.rows!.pop()!);
    }

    (clone as TableElement).rows = cloneRows;

    return clone;
  }
}
