import { rgb, PDFPage, PDFFont, RGB, StandardFonts } from 'pdf-lib';

// Define a Style interface
export interface Style {
  [key: string]: string | number | undefined;
  font?: 'TimesRoman' | 'Helvetica' | 'Courier';
  'font-size'?: number;
  'font-weight'?: 'normal' | 'bold';
  color?: string;
  'background-color'?: string;
  margin?: number;
  'margin-top'?: number;
  'margin-right'?: number;
  'margin-bottom'?: number;
  'margin-left'?: number;
  padding?: number;
  'padding-top'?: number;
  'padding-right'?: number;
  'padding-bottom'?: number;
  'padding-left'?: number;
  border?: number;
  'border-color'?: string;
  'border-top'?: number;
  'border-right'?: number;
  'border-bottom'?: number;
  'border-left'?: number;
  'align-content-horizontally'?: 'start' | 'center' | 'end';
  'align-content-vertically'?: 'start' | 'center' | 'end';
}

// Define a ComputedStyles interface
export interface ComputedStyles {
  font: StandardFonts;
  fontSize: number;
  color: RGB;
  backgroundColor: RGB;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  borderTop: number;
  borderRight: number;
  borderBottom: number;
  borderLeft: number;
  borderColor: RGB;
  alignContentHorizontally: 'start' | 'center' | 'end';
  alignContentVertically: 'start' | 'center' | 'end';
}
export interface CalculatedPositionAdjustment {
  contentX: number; // x position adjustment for text
  contentY: number; // y position adjustment for text
  boxX: number; // x position adjustment for background box
  boxY: number; // y position adjustment for background box
}

export interface ContainerElement {
  readonly children: Element[];
}
// Define an abstract base class for an Element
export abstract class Element {
  private styles: Style;
  private _computedStyles?: ComputedStyles;

  private _heightDiff?: number;

  private _positionAdjustment?: CalculatedPositionAdjustment;
  protected get positionAdjustment(): CalculatedPositionAdjustment {
    if (!this._positionAdjustment) {
      // debugger
      this._positionAdjustment = {
        contentX: this.calculateContentXAdjustment(),
        contentY: this.calculateContentYAdjustment(),
        boxX: this.computedStyles.marginLeft + this.computedStyles.borderLeft,
        boxY: -(
          this.innerHeight +
          this.computedStyles.marginTop +
          this.computedStyles.borderTop
        ),
      };
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
    if (!this._computedStyles) this._computedStyles = this.computeStyles();
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

  async init(page: PDFPage) {
    this.page = page;
    this.font = await this.page.doc.embedFont(this.computedStyles.font);

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
    this._computedStyles = this.computeStyles();

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

  private computeStyles(): ComputedStyles {
    const defaultStyles: ComputedStyles = {
      font: StandardFonts.Helvetica,
      fontSize: 14,
      color: rgb(0, 0, 0),
      backgroundColor: rgb(1, 1, 1), // white background
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      borderTop: 0,
      borderRight: 0,
      borderBottom: 0,
      borderLeft: 0,
      borderColor: rgb(0, 0, 0),
      alignContentHorizontally: 'start',
      alignContentVertically: 'start',
    };

    let computedFontName = 'Helvetica';
    if (this.styles['font']) computedFontName = this.styles['font'];
    if (this.styles['font-weight'] === 'bold') computedFontName += 'Bold';

    let computedFont: StandardFonts = defaultStyles.font;
    if (computedFontName && computedFontName in StandardFonts) {
      computedFont =
        StandardFonts[computedFontName as keyof typeof StandardFonts];
    }
    const computedFontSize = this.styles['font-size'] ?? defaultStyles.fontSize;
    const computedPaddingTop =
      this.styles['padding-top'] ??
      this.styles.padding ??
      defaultStyles.paddingTop;
    const computedPaddingRight =
      this.styles['padding-right'] ??
      this.styles.padding ??
      defaultStyles.paddingRight;
    const computedPaddingBottom =
      this.styles['padding-bottom'] ??
      this.styles.padding ??
      defaultStyles.paddingBottom;
    const computedPaddingLeft =
      this.styles['padding-left'] ??
      this.styles.padding ??
      defaultStyles.paddingLeft;

    const computedMarginTop =
      this.styles['margin-top'] ??
      this.styles.margin ??
      defaultStyles.marginTop;
    const computedMarginRight =
      this.styles['margin-right'] ??
      this.styles.margin ??
      defaultStyles.marginRight;
    const computedMarginBottom =
      this.styles['margin-bottom'] ??
      this.styles.margin ??
      defaultStyles.marginBottom;
    const computedMarginLeft =
      this.styles['margin-left'] ??
      this.styles.margin ??
      defaultStyles.marginLeft;

    const computedBorderTop =
      this.styles['border-top'] ??
      this.styles.border ??
      defaultStyles.borderTop;
    const computedBorderRight =
      this.styles['border-right'] ??
      this.styles.border ??
      defaultStyles.borderRight;
    const computedBorderBottom =
      this.styles['border-bottom'] ??
      this.styles.border ??
      defaultStyles.borderBottom;
    const computedBorderLeft =
      this.styles['border-left'] ??
      this.styles.border ??
      defaultStyles.borderLeft;

    const alignContentHorizontally =
      this.styles['align-content-horizontally'] ??
      defaultStyles.alignContentHorizontally;
    const alignContentVertically =
      this.styles['align-content-vertically'] ??
      defaultStyles.alignContentVertically;

    return {
      font: computedFont,
      fontSize: computedFontSize,
      color: this.styles['color']
        ? hexToRgb(this.styles['color'])
        : defaultStyles.color,
      backgroundColor: this.styles['background-color']
        ? hexToRgb(this.styles['background-color'])
        : defaultStyles.backgroundColor,
      paddingTop: computedPaddingTop,
      paddingRight: computedPaddingRight,
      paddingBottom: computedPaddingBottom,
      paddingLeft: computedPaddingLeft,
      marginTop: computedMarginTop,
      marginRight: computedMarginRight,
      marginBottom: computedMarginBottom,
      marginLeft: computedMarginLeft,
      borderTop: computedBorderTop,
      borderRight: computedBorderRight,
      borderBottom: computedBorderBottom,
      borderLeft: computedBorderLeft,
      borderColor: this.styles['border-color']
        ? hexToRgb(this.styles['border-color'])
        : defaultStyles.borderColor,
      alignContentHorizontally,
      alignContentVertically,
    };
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

  protected calculateContentYAdjustment(customContentHeight?: number): number {
    // Destructure commonly used style properties for better readability and efficiency
    const {
      paddingTop,
      marginTop,
      borderTop,
      paddingBottom,
      marginBottom,
      borderBottom,
      alignContentVertically,
    } = this.computedStyles;

    // Pre-calculate offsets and adjustments
    const totalTopOffset = paddingTop + marginTop + borderTop;
    const totalBottomOffset = paddingBottom + marginBottom + borderBottom;
    const contentHeightAdjustment = customContentHeight ?? this.contentHeight;
    const containerHeightAdjustment = this.height - totalBottomOffset;

    switch (alignContentVertically) {
      case 'start':
        // Align content to the start (top)
        return -totalTopOffset;
      case 'end':
        // Align content to the end (bottom)
        return -(containerHeightAdjustment - contentHeightAdjustment);
      case 'center': {
        // Align content to the center
        const centerOffset = (this.innerHeight - contentHeightAdjustment) / 2;
        const centerPos = -(marginTop + borderTop + centerOffset);
        const startPos = -totalTopOffset;
        return centerPos > startPos ? startPos : centerPos;
      }
      default:
        throw new Error('Illegal align value');
    }
  }

  protected calculateContentXAdjustment(customContentWidth?: number): number {
    // Destructure commonly used style properties for better readability and efficiency
    const {
      paddingLeft,
      marginLeft,
      borderLeft,
      paddingRight,
      marginRight,
      borderRight,
      alignContentHorizontally,
    } = this.computedStyles;

    // Pre-calculate offsets and adjustments
    const totalLeftOffset = paddingLeft + marginLeft + borderLeft;
    const totalRightOffset = paddingRight + marginRight + borderRight;
    const contentWidthAdjustment = customContentWidth ?? this.contentWidth;
    const containerWidthAdjustment = this.width - contentWidthAdjustment;

    switch (alignContentHorizontally) {
      case 'start':
        // Align content to the start (left)
        return totalLeftOffset;
      case 'end':
        // Align content to the end (right)
        return containerWidthAdjustment - totalRightOffset;
      case 'center': {
        // Align content to the center
        const centerOffset = (this.innerWidth - contentWidthAdjustment) / 2;
        const centerPos = marginLeft + borderLeft + centerOffset;
        const startPos = totalLeftOffset;
        return centerPos < startPos ? startPos : centerPos;
      }
      default:
        throw new Error('Illegal align value');
    }
  }
}

// Utility function to convert hex color to rgb
export function hexToRgb(hex: string): RGB {
  return rgb(
    parseInt(hex.substring(1, 3), 16) / 255,
    parseInt(hex.substring(3, 5), 16) / 255,
    parseInt(hex.substring(5, 7), 16) / 255
  );
}
