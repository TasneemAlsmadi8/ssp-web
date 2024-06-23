import { rgb, PDFPage, PDFFont, RGB } from 'pdf-lib';

// Define a Style interface
export interface Style {
  [key: string]: string | number | undefined;
  'font-size'?: number;
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
}

// Define a ComputedStyles interface
export interface ComputedStyles {
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
}
export interface CalculatedPositionAdjustment {
  textX: number; // x position adjustment for text
  textY: number; // y position adjustment for text
  boxX: number; // x position adjustment for background box
  boxY: number; // y position adjustment for background box
}

// Define an abstract base class for an Element
export abstract class Element {
  private styles: Style;
  private _computedStyles?: ComputedStyles;
  textContent: string;
  font?: PDFFont;

  private _positionAdjustment?: CalculatedPositionAdjustment;
  protected get positionAdjustment(): CalculatedPositionAdjustment {
    if (!this._positionAdjustment) {
      // debugger
      this._positionAdjustment = {
        textX:
          this.computedStyles.paddingLeft +
          this.computedStyles.marginLeft +
          this.computedStyles.borderLeft,
        textY: -(
          0.75 * this.computedStyles.fontSize +
          this.computedStyles.paddingTop +
          this.computedStyles.marginTop +
          this.computedStyles.borderTop
        ),
        boxX: this.computedStyles.marginLeft + this.computedStyles.borderLeft,
        boxY: -(
          // 0.25 * this.computedStyles.fontSize +
          (
            this.innerHeight +
            this.computedStyles.marginTop +
            // this.computedStyles.borderTop +
            this.computedStyles.borderTop
          )
        ),
      };
    }
    return this._positionAdjustment;
  }

  protected page!: PDFPage;
  protected parentWidth!: number;

  protected get computedStyles(): ComputedStyles {
    if (!this._computedStyles) this._computedStyles = this.computeStyles();
    return this._computedStyles;
  }
  constructor() {
    this.styles = {};
    this.textContent = '';
  }

  setStyle(name: keyof Style, value: string | number) {
    this.styles[name] = value;
    this._computedStyles = undefined;
  }

  setTextContent(text: string) {
    this.textContent = text;
  }

  render(page: PDFPage, parentWidth: number, x: number, y: number): void {
    this.page = page;
    this.parentWidth = parentWidth;
    this._computedStyles = this.computeStyles();
    this.drawBackground(x, y);
    this.drawBorder(x, y);
    this.draw(x, y);
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

  protected abstract draw(x: number, y: number): Promise<void>;

  abstract readonly innerHeight: number; // Abstract inner height property
  abstract readonly innerWidth: number; // Abstract inner width property

  private computeStyles(): ComputedStyles {
    const defaultStyles: ComputedStyles = {
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
      borderColor: rgb(0, 0, 0), // default black border
    };

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

    return {
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
    };
  }

  drawBorder(x: number, y: number) {
    const { borderTop, borderRight, borderBottom, borderLeft, borderColor } =
      this.computedStyles;

    const startX = x + this.positionAdjustment.boxX;
    const startY = y + this.positionAdjustment.boxY;
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
          height: this.innerHeight,
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

  drawBackground(x: number, y: number) {
    const { backgroundColor } = this.computedStyles;
    if (
      backgroundColor.red !== 1 ||
      backgroundColor.blue !== 1 ||
      backgroundColor.green !== 1
    ) {
      this.page.drawRectangle({
        x: x + this.positionAdjustment.boxX,
        y: y + this.positionAdjustment.boxY,
        width: this.innerWidth,
        height: this.innerHeight,
        color: backgroundColor,
      });
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
