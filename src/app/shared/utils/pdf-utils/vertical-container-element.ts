import { Style, Element, ContainerElement } from './abstract-element';

export interface Width {
  pixels?: number;
  percent?: number;
}

export class VerticalContainerElement
  extends Element
  implements ContainerElement
{
  constructor() {
    super();
    this._children = [];
  }

  get contentHeight(): number {
    if (!this.children || this.children.length === 0) {
      return 0;
    }
    return this.children.reduce((sum, cur) => (sum += cur.height), 0);
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

  addElement(element: Element) {
    this._children!.push(element);
  }

  async draw() {
    let cursorY = this.position.y + this.positionAdjustment.contentY;
    let cursorX = this.position.x + this.positionAdjustment.contentX;

    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];

      await child.render({ x: cursorX, y: cursorY, maxWidth: this.maxWidth });

      cursorY -= child.height;
    }
  }
}
