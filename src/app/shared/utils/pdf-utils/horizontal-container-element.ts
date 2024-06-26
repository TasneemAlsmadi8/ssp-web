import { Style, Element, ContainerElement } from './abstract-element';

export interface Width {
  pixels?: number;
  percent?: number;
}

export class HorizontalContainerElement
  extends Element
  implements ContainerElement
{
  childrenWidth: Width[] = [];
  constructor() {
    super();
    this._children = [];
  }

  get contentHeight(): number {
    if (!this.children || this.children.length === 0) {
      return 0;
    }
    return this.children.reduce(
      (max, cur) => (max > cur.height ? max : cur.height),
      this.children[0].height
    );
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

  addElement(element: Element, maxWidth: Width) {
    this._children!.push(element);
    this.childrenWidth.push(maxWidth);
  }

  private calculateWidth(width: Width): number {
    let result = 0;
    let percentPixel: number = 0;
    if (width.percent) {
      if (width.percent < 0 || width.percent > 100)
        throw new Error('width percentage must be between 0 and 100');
      percentPixel = (width.percent / 100) * this.contentWidth;
    }

    if (width.pixels && width.percent) result = width.pixels + percentPixel;
    else if (width.pixels) result = width.pixels;
    else if (width.percent) result = percentPixel;
    else
      throw new Error(
        'You must provide max width with either pixels or percent'
      );

    if (result <= 0)
      throw new Error('Total element width must be greater than 0');

    return result;
  }

  async draw() {
    let cursorY = this.position.y + this.positionAdjustment.contentY;
    let cursorX = this.position.x + this.positionAdjustment.contentX;

    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];
      const maxWidth = this.calculateWidth(this.childrenWidth[index]);

      child.setHeight(this.contentHeight);
      await child.render({ x: cursorX, y: cursorY, maxWidth });

      cursorX += maxWidth;
    }
  }
}
