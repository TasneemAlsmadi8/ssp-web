import { ContainerElement } from './abstract-element';
import { Element } from './abstract-element';
import { PageOptions } from './element-styles';

export class VerticalContainerElement
  extends Element
  implements ContainerElement
{
  constructor(pageOptions: PageOptions) {
    super(pageOptions);
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

  override preRender(preRenderArgs: {
    x: number;
    y: number;
    maxWidth: number;
  }): void {
    super.preRender(preRenderArgs);
    let cursorY = this.position.y + this.positionAdjustment.contentY;
    let cursorX = this.position.x + this.positionAdjustment.contentX;

    for (const child of this.children) {
      child.preRender({
        x: cursorX,
        y: cursorY,
        maxWidth: this.contentWidth,
      });
      cursorY -= child.heightOffset;
    }
  }

  async draw() {
    for (const child of this.children) {
      await child.render();
    }
  }

  protected override async splitElementOnOverflow({
    availableHeight,
    clone,
  }: {
    availableHeight: number;
    clone: Element;
  }): Promise<Element> {
    const cloneChildren: Element[] = [];
    let childOnBoundary: Element;
    while (this.contentHeight > availableHeight) {
      cloneChildren.unshift(this._children!.pop()!);
    }
    childOnBoundary = cloneChildren.shift()!;
    const splitChild = await childOnBoundary.handleOverflow();

    this.addElement(childOnBoundary);
    cloneChildren.unshift(splitChild);

    (clone as VerticalContainerElement)._children = cloneChildren;

    return clone;
  }

  override clone(): VerticalContainerElement {
    return super.clone() as VerticalContainerElement;
  }
}
