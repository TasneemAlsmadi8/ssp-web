import {
  ElementStyleCalculator,
} from './element-styles';
import {
  Style,
  ComputedStyles,
  CustomFont,
  CalculatedPositionAdjustment,
  hexToRgb,
} from './element-styles';
import { PDFPage, PDFFont } from 'pdf-lib';

export interface ParentElement {
  readonly children: Element[];
}

export interface ContainerElement extends ParentElement {
  addElement(element: Element, options?: { [key: string]: any }): void;
}
export abstract class Element {
  private styles: Style;
  private _computedStyles?: ComputedStyles;

  private _heightDiff?: number;

  private _positionAdjustment?: CalculatedPositionAdjustment;
  protected get positionAdjustment(): CalculatedPositionAdjustment {
    if (!this._positionAdjustment) {
      this._positionAdjustment =
        ElementStyleCalculator.calculatePositionAdjustment(
          this.computedStyles,
          {
            height: this.height,
            innerHeight: this.innerHeight,
            contentHeight: this.contentHeight,
            width: this.width,
            innerWidth: this.innerWidth,
            contentWidth: this.contentWidth,
          }
        );
    }
    return this._positionAdjustment;
  }

  protected page!: PDFPage;
  protected maxWidth!: number;
  protected position!: { x: number; y: number };
  protected font!: PDFFont;

  showBoxes: boolean = false;

  private _isPreRenderDone = false;

  private get isPreRenderDone(): boolean {
    return (
      this._isPreRenderDone &&
      this.maxWidth !== undefined &&
      this.position?.x !== undefined &&
      this.position?.y !== undefined
    );
  }
  protected get computedStyles(): ComputedStyles {
    if (!this._computedStyles)
      this._computedStyles = ElementStyleCalculator.computeStyles(this.styles);
    return this._computedStyles;
  }
  constructor() {
    this.styles = {};
  }

  setStyle(name: keyof Style, value: string | number) {
    this.styles[name] = value;
    this._computedStyles = undefined;
  }

  setStyles(styles: Style) {
    const removeUndefined = <T = any>(obj: any): T =>
      Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
      ) as T;

    styles = removeUndefined<Style>(styles);
    this.styles = { ...this.styles, ...styles };
  }

  setHeight(value: number) {
    // if( value < this.height) throw new Error("Can not set height smaller than content");
    this._heightDiff = value - this.height;
  }

  addCustomFont(customFont: CustomFont) {
    ElementStyleCalculator.addCustomFont(customFont);
  }

  async init(page: PDFPage) {
    this.page = page;
    if (!this.font) {
      this.font = await this.page.doc.embedFont(this.computedStyles.font);
    }

    if (this.children)
      for (const child of this.children) await child.init(page);
  }

  async preRender(preRenderArgs: {
    x?: number;
    y?: number;
    maxWidth?: number;
  }) {
    const { x, y, maxWidth } = preRenderArgs;
    if (!this.page)
      throw new Error('Element must be initialized before rendering');

    if (maxWidth) this.maxWidth = maxWidth;
    if (x && y) this.position = { x, y };
    if (!this._computedStyles)
      this._computedStyles = ElementStyleCalculator.computeStyles(this.styles);

    this._isPreRenderDone = true;
  }

  async render(preRenderArgs?: {
    x?: number;
    y?: number;
    maxWidth?: number;
  }): Promise<void> {
    if (preRenderArgs) this.preRender(preRenderArgs);
    if (!this.isPreRenderDone)
      throw new Error(
        'Pre render calculation is not fully done.\nEither call preRender with all arguments, or fully provide preRenderArgs'
      );

    if (this.preDraw) await this.preDraw();
    this.drawBackground();
    if (this.showBoxes) this.drawBoxes();
    await this.draw();
    this.drawBorder();
  }

  get height(): number {
    return (
      this.innerHeight +
      this.computedStyles.marginTop +
      this.computedStyles.marginBottom +
      this.computedStyles.borderTop +
      this.computedStyles.borderBottom
    );
  }

  get width(): number {
    return (
      this.innerWidth +
      this.computedStyles.marginLeft +
      this.computedStyles.marginRight +
      this.computedStyles.borderLeft +
      this.computedStyles.borderRight
    );
  }

  protected _children?: Element[] | undefined; // Abstract inner height property

  get children(): Element[] {
    if (!this._children) return [];
    return [...this._children];
  }
  protected preDraw?(): Promise<void>;
  protected abstract draw(): Promise<void>;

  get innerHeight(): number {
    return (
      this.contentHeight +
      this.computedStyles.paddingTop +
      this.computedStyles.paddingBottom +
      (this._heightDiff ?? 0)
    );
  }
  get innerWidth(): number {
    // always full of parent
    return (
      this.maxWidth -
      this.computedStyles.marginLeft -
      this.computedStyles.marginRight
    );
  }
  abstract readonly contentHeight: number; // Abstract inner height property
  abstract readonly contentWidth: number; // Abstract inner width property

  drawBorder() {
    const { borderTop, borderRight, borderBottom, borderLeft, borderColor } =
      this.computedStyles;

    const startX = this.position.x + this.positionAdjustment.boxX;
    const startY = this.position.y + this.positionAdjustment.boxY;
    const endX = startX + this.innerWidth;
    const endY = startY + this.innerHeight;

    // Check if all borders are the same
    if (
      borderTop === borderRight &&
      borderTop === borderBottom &&
      borderTop === borderLeft
    ) {
      if (borderTop > 0) {
        this.page.drawRectangle({
          x: startX,
          y: startY,
          width: this.innerWidth,
          height: this.innerHeight + borderBottom,
          borderColor,
          borderWidth: borderTop,
        });
      }
    } else {
      // Draw each border individually if they differ
      if (borderTop > 0) {
        this.page.drawLine({
          start: { x: startX, y: endY },
          end: { x: endX, y: endY },
          thickness: borderTop,
          color: borderColor,
        });
      }
      if (borderRight > 0) {
        this.page.drawLine({
          start: { x: endX, y: startY },
          end: { x: endX, y: endY },
          thickness: borderRight,
          color: borderColor,
        });
      }
      if (borderBottom > 0) {
        this.page.drawLine({
          start: { x: startX, y: startY },
          end: { x: endX, y: startY },
          thickness: borderBottom,
          color: borderColor,
        });
      }
      if (borderLeft > 0) {
        this.page.drawLine({
          start: { x: startX, y: startY },
          end: { x: startX, y: endY },
          thickness: borderLeft,
          color: borderColor,
        });
      }
    }
  }

  drawBoxes() {
    const s = this.computedStyles;
    const colors = {
      margin: hexToRgb('#a87132'),
      // border: hexToRgb('#bf9667'),
      padding: hexToRgb('#96bf67'),
      inner: hexToRgb('#5d75a6'),
      content: hexToRgb('#a65da1'),
    };
    this.page.drawRectangle({
      x: this.position.x,
      y: this.position.y - this.height,
      width: this.width,
      height: this.height,
      color: colors.margin,
    });
    this.page.drawRectangle({
      x: this.position.x + this.positionAdjustment.boxX,
      y: this.position.y + this.positionAdjustment.boxY,
      width: this.innerWidth,
      height: this.innerHeight,
      color: colors.padding,
    });
    const innerAreaHeight = this.innerHeight - s.paddingTop - s.paddingBottom;
    this.page.drawRectangle({
      x: this.position.x + this.positionAdjustment.boxX + s.paddingLeft,
      y: this.position.y + this.positionAdjustment.boxY + s.paddingTop,
      width: this.innerWidth - s.paddingLeft - s.paddingRight,
      height: innerAreaHeight,
      color: colors.inner,
    });
    this.page.drawRectangle({
      x: this.position.x + this.positionAdjustment.contentX,
      y:
        this.position.y + this.positionAdjustment.contentY - this.contentHeight,
      width: this.contentWidth,
      height: this.contentHeight,
      color: colors.content,
    });
  }

  drawBackground() {
    const { backgroundColor } = this.computedStyles;
    if (
      backgroundColor.red !== 1 ||
      backgroundColor.blue !== 1 ||
      backgroundColor.green !== 1
    ) {
      this.page.drawRectangle({
        x: this.position.x + this.positionAdjustment.boxX,
        y: this.position.y + this.positionAdjustment.boxY,
        width: this.innerWidth,
        height: this.innerHeight,
        color: backgroundColor,
      });
    }
  }

  protected calculateContentYAdjustment(customContentHeight: number): number {
    return ElementStyleCalculator.calculateContentYAdjustment(
      this.computedStyles,
      {
        height: this.height,
        innerHeight: this.innerHeight,
        contentHeight: this.contentHeight,
      },
      customContentHeight
    );
  }

  protected calculateContentXAdjustment(customContentWidth: number): number {
    return ElementStyleCalculator.calculateContentXAdjustment(
      this.computedStyles,
      {
        width: this.width,
        innerWidth: this.innerWidth,
        contentWidth: this.contentWidth,
      },
      customContentWidth
    );
  }
}
