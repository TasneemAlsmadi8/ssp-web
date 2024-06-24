import { ParagraphElement } from './paragraph-element';

export class TableCellElement extends ParagraphElement {
  private _height?: number;

  override get height() {
    if (this._height) return this._height;
    return super.height;
  }

  override set height(value: number) {
    this._height = value;
  }
}
