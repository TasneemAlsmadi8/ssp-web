import { ParagraphElement } from './paragraph-element';

export class TableCellElement extends ParagraphElement {
  private _heightDiff?: number;

  override get innerHeight() {
    return super.innerHeight + (this._heightDiff ?? 0);
  }

  setHeight(value: number) {
    // if( value < this.height) throw new Error("Can not set height smaller than content");
    this._heightDiff = value - this.height;
  }
}
