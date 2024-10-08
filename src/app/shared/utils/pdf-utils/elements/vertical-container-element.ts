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

  @Element.UseFallbackFont
  override preRenderDimensions(args: { maxWidth: number }): void {
    super.preRenderDimensions(args);
    if (!this._children || this._children.length === 0) return;
    for (const child of this._children) {
      child.preRenderDimensions({
        maxWidth: this.contentWidth,
      });
    }
  }

  @Element.UseFallbackFont
  override preRenderPosition(position: { x: number; y: number }): void {
    super.preRenderPosition(position);
    if (!this._children || this._children.length === 0) return;
    let cursorY = this.position.y + this.positionAdjustment.contentY;
    let cursorX = this.position.x + this.positionAdjustment.contentX;

    for (const child of this._children) {
      child.preRenderPosition({
        x: cursorX,
        y: cursorY,
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
    availableContentHeight,
    clone,
  }: {
    availableContentHeight: number;
    clone: Element;
  }): Promise<Element> {
    const cloneChildren: Element[] = [];
    let childOnBoundary: Element;
    while (this.contentHeight > availableContentHeight) {
      cloneChildren.unshift(this._children!.pop()!);
    }
    childOnBoundary = cloneChildren.shift()!;
    const splitChild = await childOnBoundary.handleOverflow();

    this.addElement(childOnBoundary);
    cloneChildren.unshift(splitChild);

    cloneChildren.forEach((child) => (child.parent = clone));

    (clone as VerticalContainerElement)._children = cloneChildren;

    return clone;
  }

  override clone(): VerticalContainerElement {
    return super.clone() as VerticalContainerElement;
  }
}
