import { ElementStyleCalculator, PageDimensions } from './element-styles';
import {
  Style,
  ComputedStyles,
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
  parent?: Element;
  private _styles: Style;
  public get styles(): Style {
    return { ...this._styles };
  }
  protected computedStyles!: ComputedStyles;

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

  protected font!: PDFFont;

  protected page!: PDFPage;
  protected maxWidth!: number;
  protected position!: { x: number; y: number };

  private _widthDiff?: number;
  private isWidthFitContent = false;
  private _heightDiff?: number;

  showBoxes: boolean = false;

  private isInitDone = false;
  private _isPreRenderDone = false;

  private get isPreRenderDone(): boolean {
    return (
      this._isPreRenderDone &&
      this.maxWidth !== undefined &&
      // this._widthDiff !== undefined &&
      this.position?.x !== undefined &&
      this.position?.y !== undefined
    );
  }
  constructor(protected pageDimensions: PageDimensions) {
    this._styles = {};
  }

  setStyle(name: keyof Style, value: string | number) {
    if (this.isInitDone) throw new Error('Can not change styles after init');

    this.styles[name] = value;
  }

  setStyles(styles: Style) {
    if (this.isInitDone) throw new Error('Can not change styles after init');
    const removeUndefined = <T = any>(obj: any): T =>
      Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
      ) as T;

    styles = removeUndefined<Style>(styles);
    this._styles = { ...this.styles, ...styles };
  }

  setHeight(value: number) {
    if (this.isPreRenderDone)
      throw new Error('Can not change height after preRender');
    // if( value < this.height) throw new Error("Can not set height smaller than content");
    this._heightDiff = 0;
    this._heightDiff = value - this.height;
    if (this.height < 0) {
      console.warn(`height is less than 0! (${this.height})`);
    }
  }

  setWidth(value: number, inPreRender = false) {
    if (this.isPreRenderDone && !inPreRender)
      throw new Error('Can not change width after preRender');
    // if( value < this.height) throw new Error("Can not set height smaller than content");
    this._widthDiff = 0;
    if (!this.isWidthFitContent) this._widthDiff = value - this.width;
    if (this.width < 0) {
      console.warn(`width is less than 0! (${this.width})`);
    }
  }

  setWidthFitContent() {
    this.isWidthFitContent = true;
    this._widthDiff = 0;
  }

  setHeightFitContent() {
    this._heightDiff = 0;
  }
  async init(page: PDFPage, parent?: Element) {
    this.page = page;
    this.parent = parent;

    this._styles = ElementStyleCalculator.inheritStyles(
      this.styles,
      parent?.styles
    );
    this.computedStyles = ElementStyleCalculator.computeStyles(this.styles);
    this.font = await this.page.doc.embedFont(this.computedStyles.font);

    if (this.computedStyles.width === 'fit-content') this.setWidthFitContent();

    if (this.children)
      for (const child of this.children) await child.init(page, this);

    this.isInitDone = true;
  }

  async preRender(preRenderArgs: {
    x?: number;
    y?: number;
    maxWidth?: number;
  }) {
    const { x, y, maxWidth } = preRenderArgs;
    if (!this.isInitDone)
      throw new Error('Element must be initialized before rendering');

    if (maxWidth) {
      this.maxWidth = maxWidth;
      this.setWidth(maxWidth, true);
    }
    if (x && y) {
      this.position = ElementStyleCalculator.calculatePosition(
        this.styles,
        { x, y },
        { width: this.width, height: this.height },
        this.pageDimensions
      );
    }

    this._isPreRenderDone = true;
  }

  @Element.UseFallbackFont
  async render(preRenderArgs?: {
    x?: number;
    y?: number;
    maxWidth?: number;
  }): Promise<void> {
    // await this.executeWithFallbackFont(async () => {
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
    // });
  }

  protected preDraw?(): Promise<void>;
  protected abstract draw(): Promise<void>;

  get heightOffset() {
    if (this.styles.position === 'fixed') return 0;
    return this.height;
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
      this.contentWidth +
      this.computedStyles.paddingLeft +
      this.computedStyles.paddingRight +
      (this._widthDiff ?? 0)
    );
  }

  abstract readonly contentHeight: number; // Abstract inner height property
  abstract readonly contentWidth: number; // Abstract inner width property

  protected _children?: Element[] | undefined;

  get children(): Element[] {
    if (!this._children) return [];
    return [...this._children];
  }

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

  protected getCustomContentYAdjustment(customContentHeight: number): number {
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

  protected getCustomContentXAdjustment(customContentWidth: number): number {
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

  protected async executeWithFallbackFont(
    testFunction: (...args: any[]) => any,
    ...args: any[]
  ) {
    try {
      await testFunction(...args);
    } catch (e) {
      if (e instanceof Error && e.message.includes('WinAnsi cannot encode')) {
        console.error(
          'Custom font failed, falling back to Noto Sans English/Arabic.'
        );
        // console.log(this);

        try {
          this.font = await this.page.doc.embedFont(
            ElementStyleCalculator.getFallbackFont(this.styles)
          );
          await testFunction(...args);
        } catch (fontError) {
          console.error('Fallback font embedding failed:', fontError);
          throw fontError; // Rethrow the error after logging
        }
      } else {
        throw e; // Re-throw if it's a different error
      }
    }
  }

  protected static UseFallbackFont(
    target: object,
    methodName: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    // console.log(methodName);

    descriptor.value = async function useFallbackFontWrapper(...args: any[]) {
      try {
        await originalMethod.apply(this, args);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('WinAnsi cannot encode')
        ) {
          console.error(
            'Font failed to encode all characters, falling back to Noto Sans English/Arabic.'
          );
          // console.log(this);
          try {
            const fallbackFont = await (this as any).page.doc.embedFont(
              ElementStyleCalculator.getFallbackFont((this as any).styles)
            );
            (this as any).font = fallbackFont;
            await originalMethod.apply(this, args);
          } catch (fontError: any) {
            console.error('Fallback font embedding failed:', fontError);
            throw new Error(
              `Fallback font embedding failed: ${fontError.message}`
            );
          }
        } else {
          throw error; // Re-throw if it's a different error
        }
      }
    };

    return descriptor;
  }
}
