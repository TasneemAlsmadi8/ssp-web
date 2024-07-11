import { StandardFonts, RGB, rgb } from 'pdf-lib';

// Define a Style interface
export interface PageDimensions {
  height: number;
  width: number;
}

export interface Style {
  [key: string]: string | number | undefined;
  font?: 'TimesRoman' | 'Helvetica' | 'Courier' | string;
  'font-size'?: number;
  'font-weight'?: 'normal' | 'bold';
  'text-decoration'?: 'none' | 'underline';
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
  position?: 'static' | 'relative' | 'fixed';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  width?: 'max-width' | 'fit-content';
  height?: 'fit-content';
}

/**
 * Represents styles for child elements such as row, column, etc .
 * This type allows adding styles based on a special selection criteria
 * such as 'odd', 'even', 'first', 'last', or using a child number from 1 to the last.
 * Negative numbers can also be used to start from the end.
 */
export type ChildrenStylesSelectors = Partial<
  Record<`${number}` | 'odd' | 'even' | 'first' | 'last', Style>
>;

// Define a ComputedStyles interface
export interface ComputedStyles {
  font: StandardFonts | FontRawBytes;
  fontSize: number;
  textDecoration: 'none' | 'underline';
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
  width: 'max-width' | 'fit-content';
  height: 'max-width' | 'fit-content';
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

  static computeStyles(styles: Style): ComputedStyles {
    const defaultStyles = this.getDefaultStyles();

    const computedFont = this.computeFont(
      styles,
      defaultStyles.font.toString()
    );
    const computedFontSize = this.resolveStyle(
      styles,
      'font-size',
      defaultStyles.fontSize
    );
    const computedPadding = this.computePadding(styles, defaultStyles);
    const computedMargin = this.computeMargin(styles, defaultStyles);
    const computedBorder = this.computeBorder(styles, defaultStyles);
    const alignContentHorizontally = this.resolveStyle(
      styles,
      'align-content-horizontally',
      defaultStyles.alignContentHorizontally
    );
    const alignContentVertically = this.resolveStyle(
      styles,
      'align-content-vertically',
      defaultStyles.alignContentVertically
    );
    const width = this.resolveStyle(styles, 'width', defaultStyles.width);
    const height = this.resolveStyle(styles, 'height', defaultStyles.height);

    const textDecoration = this.resolveStyle(
      styles,
      'text-decoration',
      defaultStyles.textDecoration
    );
    const color = styles['color']
      ? hexToRgb(styles['color'])
      : defaultStyles.color;
    return {
      font: computedFont,
      fontSize: computedFontSize,
      textDecoration,
      color,
      backgroundColor: styles['background-color']
        ? hexToRgb(styles['background-color'])
        : defaultStyles.backgroundColor,
      ...computedPadding,
      ...computedMargin,
      ...computedBorder,
      borderColor: styles['border-color']
        ? hexToRgb(styles['border-color'])
        : defaultStyles.borderColor,
      alignContentHorizontally,
      alignContentVertically,
      width,
      height,
    };
  }

  static inheritStyles(styles: Style, parentStyles?: Style): Style {
    if (!parentStyles) return styles;
    return {
      ...this.getInheritedStyles(parentStyles),
      ...styles,
    };
  }

  private static getInheritedStyles(parentStyles: Style): Partial<Style> {
    return {
      font: parentStyles.font,
      'font-size': parentStyles['font-size'],
      'font-weight': parentStyles['font-weight'],
      'text-decoration': parentStyles['text-decoration'],
      color: parentStyles.color,
    };
  }

  static getDefaultStyles(): ComputedStyles {
    return {
      font: StandardFonts.Helvetica,
      fontSize: 14,
      textDecoration: 'none',
      color: rgb(0, 0, 0),
      backgroundColor: rgb(1, 1, 1),
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
      width: 'max-width',
      height: 'fit-content',
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

  static calculatePosition(
    styles: Style,
    originalPosition: { x: number; y: number },
    dimensions: { width: number; height: number },
    pageDimensions: PageDimensions
  ): { x: number; y: number } {
    const { x, y } = originalPosition;
    const { position = 'static', top, bottom, left, right } = styles;

    if (position === 'static') {
      return { x, y };
    }

    if (top !== undefined && bottom !== undefined) {
      throw new Error('You cannot specify both bottom and top styles');
    }
    if (left !== undefined && right !== undefined) {
      throw new Error('You cannot specify both left and right styles');
    }

    let computedY = y;
    let computedX = x;

    switch (position) {
      case 'relative':
        if (top !== undefined) computedY -= top;
        if (bottom !== undefined) computedY += bottom;
        if (left !== undefined) computedX += left;
        if (right !== undefined) computedX -= right;
        return { x: computedX, y: computedY };

      case 'fixed':
        if (top !== undefined) computedY = pageDimensions.height - top;
        if (bottom !== undefined) computedY = bottom + dimensions.height;
        if (left !== undefined) computedX = left;
        if (right !== undefined)
          computedX = pageDimensions.width - right - dimensions.width;
        return { x: computedX, y: computedY };

      default:
        throw new Error('Illegal position value');
    }
  }

  /**
   * Resolves and returns an array of styles that represent the children styles
   * as indicated by selectors
   */
  static resolveChildrenStyles(
    childrenCount: number,
    stylesSelectors: ChildrenStylesSelectors
  ): Style[] {
    const childrenStyles: Style[] = [];

    for (let index = 0; index < childrenCount; index++) {
      let childStyles: Style = {};
      if ('odd' in stylesSelectors && (index + 1) % 2 === 1) {
        childStyles = {
          ...childStyles,
          ...stylesSelectors['odd'],
        };
      } else if ('even' in stylesSelectors && (index + 1) % 2 === 0) {
        childStyles = {
          ...childStyles,
          ...stylesSelectors['even'],
        };
      }

      if (index === 0 && 'first' in stylesSelectors) {
        childStyles = {
          ...childStyles,
          ...stylesSelectors['first'],
        };
      } else if (index === childrenCount - 1 && 'last' in stylesSelectors) {
        childStyles = {
          ...childStyles,
          ...stylesSelectors['last'],
        };
      }

      let rowStyleKey: keyof ChildrenStylesSelectors = `${
        index - childrenCount
      }`;
      if (rowStyleKey in stylesSelectors) {
        childStyles = {
          ...childStyles,
          ...stylesSelectors[rowStyleKey],
        };
      }

      rowStyleKey = `${index + 1}`;
      if (rowStyleKey in stylesSelectors) {
        childStyles = {
          ...childStyles,
          ...(stylesSelectors[rowStyleKey] as Style),
        };
      }
      childrenStyles.push(childStyles);
    }

    return childrenStyles;
  }

  private static resolveStyle(
    styles: Style,
    styleProp: string,
    defaultProp: any,
    aliasStyleProp?: string
  ) {
    const aliasStyle = aliasStyleProp ? styles[aliasStyleProp] : undefined;
    return styles[styleProp] ?? aliasStyle ?? defaultProp;
  }

  private static computePadding(styles: Style, defaultStyles: ComputedStyles) {
    return {
      paddingTop: this.resolveStyle(
        styles,
        'padding-top',
        defaultStyles.paddingTop,
        'padding'
      ),
      paddingRight: this.resolveStyle(
        styles,
        'padding-right',
        defaultStyles.paddingRight,
        'padding'
      ),
      paddingBottom: this.resolveStyle(
        styles,
        'padding-bottom',
        defaultStyles.paddingBottom,
        'padding'
      ),
      paddingLeft: this.resolveStyle(
        styles,
        'padding-left',
        defaultStyles.paddingLeft,
        'padding'
      ),
    };
  }

  private static computeMargin(styles: Style, defaultStyles: ComputedStyles) {
    return {
      marginTop: this.resolveStyle(
        styles,
        'margin-top',
        defaultStyles.marginTop,
        'margin'
      ),
      marginRight: this.resolveStyle(
        styles,
        'margin-right',
        defaultStyles.marginRight,
        'margin'
      ),
      marginBottom: this.resolveStyle(
        styles,
        'margin-bottom',
        defaultStyles.marginBottom,
        'margin'
      ),
      marginLeft: this.resolveStyle(
        styles,
        'margin-left',
        defaultStyles.marginLeft,
        'margin'
      ),
    };
  }

  private static computeBorder(styles: Style, defaultStyles: ComputedStyles) {
    return {
      borderTop: this.resolveStyle(
        styles,
        'border-top',
        defaultStyles.borderTop,
        'border'
      ),
      borderRight: this.resolveStyle(
        styles,
        'border-right',
        defaultStyles.borderRight,
        'border'
      ),
      borderBottom: this.resolveStyle(
        styles,
        'border-bottom',
        defaultStyles.borderBottom,
        'border'
      ),
      borderLeft: this.resolveStyle(
        styles,
        'border-left',
        defaultStyles.borderLeft,
        'border'
      ),
    };
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
}
