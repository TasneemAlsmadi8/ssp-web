import { ContainerElement } from './abstract-element';
import { Element } from './abstract-element';
import { PageOptions } from './element-styles';

export interface Width {
  pixels?: number;
  percent?: number;
}

export class HorizontalContainerElement
  extends Element
  implements ContainerElement
{
  childrenWidth: Width[] = [];
  constructor(pageOptions: PageOptions) {
    super(pageOptions);
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

  addElement(element: Element, options: { maxWidth: Width }) {
    this._children!.push(element);
    this.childrenWidth.push(options.maxWidth);
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

  override preRender(preRenderArgs: {
    x?: number | undefined;
    y?: number | undefined;
    maxWidth?: number | undefined;
  }): void {
    super.preRender(preRenderArgs);
    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];
      const maxWidth = this.calculateWidth(this.childrenWidth[index]);
      // TODO: check why problem happened (which required to add 'true')
      child.setHeight(this.contentHeight, true); 
      child.preRender({ maxWidth });
    }
  }

  async draw() {
    let cursorY = this.position.y + this.positionAdjustment.contentY;
    let cursorX = this.position.x + this.positionAdjustment.contentX;

    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];

      await child.render({ x: cursorX, y: cursorY });

      cursorX += child.width;
    }
  }

  override clone(): HorizontalContainerElement {
    const cloned = super.clone() as HorizontalContainerElement;
    cloned.childrenWidth = [...this.childrenWidth];
    return cloned;
  }

  protected override async splitElementOnOverflow({
    availableHeight,
    clone,
  }: {
    availableHeight: number;
    clone: Element;
  }): Promise<Element> {
    const splitChildren: Element[] = [];
    for (const child of this._children!) {
      splitChildren.push(await child.handleOverflow());
    }

    (clone as HorizontalContainerElement)._children = splitChildren;

    return clone;
  }
}
