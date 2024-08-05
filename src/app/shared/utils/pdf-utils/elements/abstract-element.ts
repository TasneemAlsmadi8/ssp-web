import {
  ElementStyleCalculator,
  FontRawBytes,
  PageOptions,
} from './element-styles';
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
  protected embeddedFonts: Record<string, PDFFont> = {};

  private pageFactory!: () => Promise<PDFPage>;
  protected page!: PDFPage;
  protected maxWidth!: number;
  protected position!: { x: number; y: number };

  get positionX() {
    return this.position.x;
  }
  get positionY() {
    return this.position.y;
  }

  private _widthDiff?: number;
  private isWidthFitContent = false;
  private _heightDiff?: number;

  showBoxes: boolean = false;

  private isInitDone = false;
  private isPreRenderDimensionsDone = false;
  private isPreRenderPositionDone = false;

  private get isPreRenderDone(): boolean {
    return (
      this.isPreRenderDimensionsDone &&
      this.isPreRenderPositionDone &&
      this.maxWidth !== undefined &&
      // this._widthDiff !== undefined &&
      this.position?.x !== undefined &&
      this.position?.y !== undefined
    );
  }

  constructor(protected pageOptions: PageOptions) {
    this._styles = {};
  }

  private _overflowY?: number;
  private get overflowY(): number {
    if (this._overflowY === undefined) {
      if (this.styles.position === 'fixed') return 0;
      // if parent does not overflow then children do not too
      // important ub case of fixed/relative parents
      if (this.parent?.overflowY === 0) return 0;

      const pageLowerY = 0 + this.pageOptions.marginBottom; // pdf-lib y offset starts from bottom of page
      let elementLowerY = this.position.y - this.height;

      if (this.styles.position === 'relative') {
        // reverse relative adjustment to compute overflow based on static position
        const { top, bottom } = this.styles;
        if (top) elementLowerY += top;
        if (bottom) elementLowerY -= bottom;
      }

      if (elementLowerY >= pageLowerY) return 0;
      this._overflowY = pageLowerY - elementLowerY;
    }
    return this._overflowY;
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

  setHeight(value: number, inPreRender = false) {
    if (this.isPreRenderDone && !inPreRender) {
      throw new Error('Can not change height after preRender');
    }
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

  private changePage(page: PDFPage) {
    this.page = page;
    this.children.forEach((child) => child.changePage(page));
  }

  protected async getEmbeddedFont(
    fontName: string,
    fontRawBytes: FontRawBytes
  ): Promise<PDFFont> {
    if (fontName in this.embeddedFonts) return this.embeddedFonts[fontName];
    const font = await this.page.doc.embedFont(fontRawBytes);
    this.embeddedFonts[fontName] = font;
    return font;
  }

  async init(
    page: PDFPage,
    pageFactory: () => Promise<PDFPage>,
    parent?: Element
  ) {
    this.page = page;
    this.pageFactory = pageFactory;
    this.parent = parent;

    this._styles = ElementStyleCalculator.inheritStyles(
      this.styles,
      parent?.styles
    );
    this.computedStyles = ElementStyleCalculator.computeStyles(this.styles);

    if (parent) this.embeddedFonts = parent.embeddedFonts;
    this.font = await this.getEmbeddedFont(
      this.computedStyles.fontName,
      this.computedStyles.fontRawBytes
    );

    if (this.computedStyles.width === 'fit-content') this.setWidthFitContent();

    for (const child of this.children)
      await child.init(page, pageFactory, this);

    this.isInitDone = true;
  }

  preRenderDimensions(args: { maxWidth: number }): void {
    if (!this.isInitDone)
      throw new Error('Element must be initialized before rendering');

    this.maxWidth = args.maxWidth;
    this.setWidth(args.maxWidth, true);
    this.isPreRenderDimensionsDone = true;
  }

  preRenderPosition(position: { x: number; y: number }): void {
    if (!this.isInitDone)
      throw new Error('Element must be initialized before rendering');

    this.position = ElementStyleCalculator.calculatePosition(
      this.styles,
      position,
      { width: this.width, height: this.height },
      this.pageOptions
    );
    this.isPreRenderPositionDone = true;
  }

  preRender(preRenderArgs: { x: number; y: number; maxWidth: number }): void {
    const { x, y, maxWidth } = preRenderArgs;
    if (!this.isInitDone)
      throw new Error('Element must be initialized before rendering');

    if (maxWidth) {
      this.preRenderDimensions({ maxWidth });
    }
    if (x && y) {
      this.preRenderPosition({ x, y });
    }
  }

  protected abstract splitElementOnOverflow({
    availableContentHeight,
    clone,
  }: {
    availableContentHeight: number;
    clone: Element;
  }): Promise<Element>;

  async handleOverflow(): Promise<Element> {
    const clone = this.clone();

    const offsetTop =
      this.computedStyles.borderTop +
      this.computedStyles.marginTop +
      this.computedStyles.paddingTop;
    const availableContentHeight = this.height - this.overflowY - offsetTop;
    const splitElement = await this.splitElementOnOverflow({
      availableContentHeight,
      clone,
    });

    if (!this.parent) {
      const newPage = await this.pageFactory();
      splitElement.changePage(newPage);
      splitElement.preRenderPosition({
        x: splitElement.position.x,
        y: this.pageOptions.height - this.pageOptions.marginTop,
      });
    }

    this.computedStyles.borderBottom = 0;
    this.computedStyles.marginBottom = 0;
    this.computedStyles.paddingBottom = 0;
    splitElement.computedStyles.borderTop = 0;
    splitElement.computedStyles.marginTop = 0;
    splitElement.computedStyles.paddingTop = 0;

    // void previous overflow calculation
    this._overflowY = undefined;
    return splitElement;
  }

  @Element.UseFallbackFont
  async render(): Promise<void> {
    if (!this.isPreRenderDone)
      throw new Error(
        'Pre render calculation is not fully done.\nPlease call preRender before rendering'
      );

    if (this.overflowY > 0) {
      const splitElement = await this.handleOverflow();
      await this.render();
      await splitElement.render();
    } else {
      if (this.preDraw) await this.preDraw();
      this.drawBackground();
      if (this.showBoxes) this.drawBoxes();
      await this.draw();
      this.drawBorder();
    }
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
          const { fontName, fontRawBytes } =
            ElementStyleCalculator.getFallbackFont(this.styles);
          this.font = await this.getEmbeddedFont(fontName, fontRawBytes);
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
            const { fontName, fontRawBytes } =
              ElementStyleCalculator.getFallbackFont((this as any).styles);

            const fallbackFont = await (this as any).getEmbeddedFont(
              fontName,
              fontRawBytes
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

  /**
   * Creates a clone of the current Element instance.
   *
   * Note: Cloning an element after initialization will cause the cloned element
   * to belong to the same document as the original. If you intend to use the
   * cloned element with other documents, make sure to re-initialize it.
   *
   * @returns {Element} The cloned Element instance.
   */
  clone(): Element {
    const cloned = Object.create(Object.getPrototypeOf(this)) as Element;
    cloned.pageOptions = this.pageOptions;
    cloned.parent = this.parent;
    cloned._styles = { ...this._styles };
    cloned.computedStyles = { ...this.computedStyles };
    cloned.font = this.font;
    cloned.embeddedFonts = { ...this.embeddedFonts };
    cloned.pageFactory = this.pageFactory;
    cloned.page = this.page;
    cloned.maxWidth = this.maxWidth;
    cloned.position = { ...this.position };
    cloned.showBoxes = this.showBoxes;

    cloned.isInitDone = this.isInitDone;
    cloned.isPreRenderDimensionsDone = this.isPreRenderDimensionsDone;
    cloned.isPreRenderPositionDone = this.isPreRenderPositionDone;
    cloned._children = this._children?.map((child) => child.clone());

    return cloned;
  }
}
