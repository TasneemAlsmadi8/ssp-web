import { PDFDocument, rgb, PDFPage, PDFFont, RGB } from 'pdf-lib';

// Define a Style interface
export interface Style {
  [key: string]: string | number | undefined;
  'font-size'?: number;
  color?: string;
  'background-color'?: string;
  padding?: number;
  'margin-top'?: number;
  'margin-right'?: number;
  'margin-bottom'?: number;
  'margin-left'?: number;
}

// Define a ComputedStyles interface
export interface ComputedStyles {
  fontSize: number;
  color: RGB;
  backgroundColor: RGB;
  padding: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  textX: number; // x position adjustment for text
  textY: number; // y position adjustment for text
  boxX: number; // x position adjustment for background box
  boxY: number; // y position adjustment for background box
}

// Define an abstract base class for an Element
export abstract class Element {
  styles: Style;
  textContent: string;
  font?: PDFFont;

  constructor() {
    this.styles = {};
    this.textContent = '';
  }

  setStyle(name: keyof Style, value: string | number) {
    this.styles[name] = value;
  }

  setTextContent(text: string) {
    this.textContent = text;
  }

  abstract readonly height: number; // Abstract height property
  abstract readonly innerHeight: number; // Abstract inner height property

  abstract draw(
    page: PDFPage,
    x: number,
    y: number,
    styles: ComputedStyles
  ): Promise<void>;

  computeStyles(): ComputedStyles {
    const defaultStyles: ComputedStyles = {
      fontSize: 14,
      color: rgb(0, 0, 0),
      backgroundColor: rgb(1, 1, 1), // white background
      padding: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      textX: 0,
      textY: 0,
      boxX: 0,
      boxY: 0,
    };

    const computedFontSize = this.styles['font-size'] ?? defaultStyles.fontSize;
    const computedPadding = this.styles['padding'] ?? defaultStyles.padding;
    const computedMarginTop =
      this.styles['margin-top'] ?? defaultStyles.marginTop;
    const computedMarginRight =
      this.styles['margin-right'] ?? defaultStyles.marginRight;
    const computedMarginBottom =
      this.styles['margin-bottom'] ?? defaultStyles.marginBottom;
    const computedMarginLeft =
      this.styles['margin-left'] ?? defaultStyles.marginLeft;
    const textHeight =
      (this.textContent.split('\n').length - 1) * computedFontSize;

    const textX = computedPadding + computedMarginLeft;
    const textY = -computedPadding - computedMarginTop;
    const boxX = computedMarginLeft;
    const boxY =
      -0.25 * computedFontSize -
      textHeight -
      2 * computedPadding -
      computedMarginTop;

    return {
      fontSize: computedFontSize,
      color: this.styles['color']
        ? hexToRgb(this.styles['color'])
        : defaultStyles.color,
      backgroundColor: this.styles['background-color']
        ? hexToRgb(this.styles['background-color'])
        : defaultStyles.backgroundColor,
      padding: computedPadding,
      marginTop: computedMarginTop,
      marginRight: computedMarginRight,
      marginBottom: computedMarginBottom,
      marginLeft: computedMarginLeft,
      textX,
      textY,
      boxX,
      boxY,
    };
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
