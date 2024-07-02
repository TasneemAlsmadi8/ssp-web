import { StandardFonts, RGB, rgb } from 'pdf-lib';

// Define a Style interface

export interface Style {
  [key: string]: string | number | undefined;
  font?: 'TimesRoman' | 'Helvetica' | 'Courier' | string;
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
  font: StandardFonts | FontRawBytes;
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
/**
 * | Type            | Contents                                                |
 * | --------------- | ------------------------------------------------------- |
 * | `StandardFonts` | One of the standard 14 fonts                            |
 * | `string`        | A base64 encoded string (or data URI) containing a font |
 * | `Uint8Array`    | The raw bytes of a font                                 |
 * | `ArrayBuffer`   | The raw bytes of a font                                 |
 */

export type FontRawBytes = StandardFonts | string | Uint8Array | ArrayBuffer;

export interface CustomFont {
  name: string;
  fontBytes: {
    normal: FontRawBytes;
    bold?: FontRawBytes;
  };
} // Utility function to convert hex color to rgb

export interface ElementHeightDimensions {
  height: number;
  innerHeight: number;
  contentHeight: number;
}
export interface ElementWidthDimensions {
  width: number;
  innerWidth: number;
  contentWidth: number;
}

export interface ElementDimensions
  extends ElementHeightDimensions,
    ElementWidthDimensions {}

export class ElementStyleCalculator {
  private static customFonts: CustomFont[] = [];
  private static fallbackFontName = 'Noto Sans';

  static getFallbackFont(styles: Style) {
    return this.computeFont(
      { ...styles, font: undefined },
      ElementStyleCalculator.fallbackFontName
    );
  }

  static addCustomFont(customFont: CustomFont) {
    ElementStyleCalculator.customFonts.push(customFont);
  }

  static async addFontFromUrl(options: {
    name: string;
    fontUrls: { normal: string; bold?: string };
  }) {
    const { name, fontUrls } = options;
    let actualFontUrl = fontUrls;

    // Fetch the font data
    const fontNormalArrayBuffer = await fetch(actualFontUrl.normal).then(
      (res) => res.arrayBuffer()
    );
    let fontBoldArrayBuffer;
    if (actualFontUrl.bold)
      fontBoldArrayBuffer = await fetch(actualFontUrl.bold).then((res) =>
        res.arrayBuffer()
      );

    ElementStyleCalculator.addCustomFont({
      name,
      fontBytes: {
        normal: fontNormalArrayBuffer,
        bold: fontBoldArrayBuffer,
      },
    });
  }

  static computeStyles(
    styles: Style,
    parentStyles: Partial<ComputedStyles> = {}
  ): ComputedStyles {
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
      ...parentStyles,
    };

    const computedFont = this.computeFont(
      styles,
      defaultStyles.font.toString()
    );
    const computedFontSize = styles['font-size'] ?? defaultStyles.fontSize;
    const computedPaddingTop =
      styles['padding-top'] ?? styles.padding ?? defaultStyles.paddingTop;
    const computedPaddingRight =
      styles['padding-right'] ?? styles.padding ?? defaultStyles.paddingRight;
    const computedPaddingBottom =
      styles['padding-bottom'] ?? styles.padding ?? defaultStyles.paddingBottom;
    const computedPaddingLeft =
      styles['padding-left'] ?? styles.padding ?? defaultStyles.paddingLeft;

    const computedMarginTop =
      styles['margin-top'] ?? styles.margin ?? defaultStyles.marginTop;
    const computedMarginRight =
      styles['margin-right'] ?? styles.margin ?? defaultStyles.marginRight;
    const computedMarginBottom =
      styles['margin-bottom'] ?? styles.margin ?? defaultStyles.marginBottom;
    const computedMarginLeft =
      styles['margin-left'] ?? styles.margin ?? defaultStyles.marginLeft;

    const computedBorderTop =
      styles['border-top'] ?? styles.border ?? defaultStyles.borderTop;
    const computedBorderRight =
      styles['border-right'] ?? styles.border ?? defaultStyles.borderRight;
    const computedBorderBottom =
      styles['border-bottom'] ?? styles.border ?? defaultStyles.borderBottom;
    const computedBorderLeft =
      styles['border-left'] ?? styles.border ?? defaultStyles.borderLeft;

    const alignContentHorizontally =
      styles['align-content-horizontally'] ??
      defaultStyles.alignContentHorizontally;
    const alignContentVertically =
      styles['align-content-vertically'] ??
      defaultStyles.alignContentVertically;

    return {
      font: computedFont,
      fontSize: computedFontSize,
      color: styles['color'] ? hexToRgb(styles['color']) : defaultStyles.color,
      backgroundColor: styles['background-color']
        ? hexToRgb(styles['background-color'])
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
      borderColor: styles['border-color']
        ? hexToRgb(styles['border-color'])
        : defaultStyles.borderColor,
      alignContentHorizontally,
      alignContentVertically,
    };
  }

  static computeFont(
    styles: Style,
    defaultFontName: string
  ): StandardFonts | FontRawBytes {
    let { font: fontName, 'font-weight': fontWeight } = styles;
    let font: StandardFonts | FontRawBytes;

    fontName = fontName ?? defaultFontName;

    if (fontName in StandardFonts) {
      if (fontWeight === 'bold') fontName += 'Bold';

      font = StandardFonts[fontName as keyof typeof StandardFonts];
      return font;
    }
    let customFont = ElementStyleCalculator.customFonts.find(
      (value) => fontName === value.name
    );
    if (customFont) {
      if (fontWeight === 'bold' && customFont.fontBytes.bold)
        return customFont.fontBytes.bold;
      return customFont.fontBytes.normal;
    }

    throw new Error(`Font ${fontName} Not Found`);
  }

  static calculatePositionAdjustment(
    computedStyles: ComputedStyles,
    dimensions: ElementDimensions
  ) {
    return {
      contentX: this.calculateContentXAdjustment(computedStyles, dimensions),
      contentY: this.calculateContentYAdjustment(computedStyles, dimensions),
      boxX: computedStyles.marginLeft + computedStyles.borderLeft,
      boxY: -(
        dimensions.innerHeight +
        computedStyles.marginTop +
        computedStyles.borderTop
      ),
    };
  }

  static calculateContentYAdjustment(
    computedStyles: ComputedStyles,
    dimensions: ElementHeightDimensions,
    customContentHeight?: number
  ): number {
    // Destructure commonly used style properties for better readability and efficiency
    const {
      paddingTop,
      marginTop,
      borderTop,
      paddingBottom,
      marginBottom,
      borderBottom,
      alignContentVertically,
    } = computedStyles;

    // Pre-calculate offsets and adjustments
    const totalTopOffset = paddingTop + marginTop + borderTop;
    const totalBottomOffset = paddingBottom + marginBottom + borderBottom;
    const contentHeightAdjustment =
      customContentHeight ?? dimensions.contentHeight;
    const containerHeightAdjustment = dimensions.height - totalBottomOffset;

    switch (alignContentVertically) {
      case 'start':
        // Align content to the start (top)
        return -totalTopOffset;
      case 'end':
        // Align content to the end (bottom)
        return -(containerHeightAdjustment - contentHeightAdjustment);
      case 'center': {
        // Align content to the center
        const centerOffset =
          (dimensions.innerHeight - contentHeightAdjustment) / 2;
        const centerPos = -(marginTop + borderTop + centerOffset);
        const startPos = -totalTopOffset;
        return centerPos > startPos ? startPos : centerPos;
      }
      default:
        throw new Error('Illegal align value');
    }
  }

  static calculateContentXAdjustment(
    computedStyles: ComputedStyles,
    dimensions: ElementWidthDimensions,
    customContentWidth?: number
  ): number {
    // Destructure commonly used style properties for better readability and efficiency
    const {
      paddingLeft,
      marginLeft,
      borderLeft,
      paddingRight,
      marginRight,
      borderRight,
      alignContentHorizontally,
    } = computedStyles;

    // Pre-calculate offsets and adjustments
    const totalLeftOffset = paddingLeft + marginLeft + borderLeft;
    const totalRightOffset = paddingRight + marginRight + borderRight;
    const contentWidthAdjustment =
      customContentWidth ?? dimensions.contentWidth;
    const containerWidthAdjustment = dimensions.width - contentWidthAdjustment;

    switch (alignContentHorizontally) {
      case 'start':
        // Align content to the start (left)
        return totalLeftOffset;
      case 'end':
        // Align content to the end (right)
        return containerWidthAdjustment - totalRightOffset;
      case 'center': {
        // Align content to the center
        const centerOffset =
          (dimensions.innerWidth - contentWidthAdjustment) / 2;
        const centerPos = marginLeft + borderLeft + centerOffset;
        const startPos = totalLeftOffset;
        return centerPos < startPos ? startPos : centerPos;
      }
      default:
        throw new Error('Illegal align value');
    }
  }
}

// TODO: check if this have any problems (race condition), check if there is a better way
const addDefaultFonts = () => {
  ElementStyleCalculator.addFontFromUrl({
    name: 'Noto Sans',
    fontUrls: {
      normal: '/assets/fonts/NotoSansEnglishArabic-Regular.ttf',
      bold: '/assets/fonts/NotoSansEnglishArabic-Bold.ttf',
    },
  });
};
addDefaultFonts();

export function hexToRgb(hex: string): RGB {
  return rgb(
    parseInt(hex.substring(1, 3), 16) / 255,
    parseInt(hex.substring(3, 5), 16) / 255,
    parseInt(hex.substring(5, 7), 16) / 255
  );
} // Define an abstract base class for an Element
