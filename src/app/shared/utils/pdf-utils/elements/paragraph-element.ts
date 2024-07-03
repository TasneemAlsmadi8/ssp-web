import { Element } from './abstract-element';
import { PageDimensions } from './element-styles';

export class ParagraphElement extends Element {
  textContent: string;

  constructor(pageDimensions: PageDimensions) {
    super(pageDimensions);
    this.textContent = '';
    // this.setStyle('font-size', 12);
    // this.setStyle('color', '#000000');
    // this.setStyle('padding', 2);
  }

  setTextContent(text: string) {
    this.textContent = text;
  }

  private isLTR(char: string): boolean {
    const ltrRegex =
      /[\u0041-\u005A\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F\u1E00-\u1EFF\u0400-\u04FF\u0370-\u03FF\u0030-\u0039]/;
    return ltrRegex.test(char);
  }

  private isRTL(char: string): boolean {
    const rtlRegex =
      /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
    return rtlRegex.test(char);
  }

  private isNeutral(char: string): boolean {
    const neutralRegex =
      /[\u0000-\u0020\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u2100-\u214F\/!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;
    return neutralRegex.test(char);
  }

  private splitIntoDirectionalSegments(text: string): string[] {
    const segments: string[] = [];
    let currentSegment = '';
    let currentDirection: 'ltr' | 'rtl' | null = null;

    for (const char of text) {
      let isLTR, isRTL, isNeutral;
      isLTR = this.isLTR(char);
      if (!isLTR) isRTL = this.isRTL(char);
      if (!isRTL) isNeutral = this.isNeutral(char);

      if (!isLTR && !isRTL && !isNeutral)
        throw new Error(`Problem in direction detection for char: (${char})`);

      if (isNeutral) {
        currentSegment += char;
      } else if (
        isLTR &&
        (currentDirection === 'ltr' || currentDirection === null)
      ) {
        currentSegment += char;
        currentDirection = 'ltr';
      } else if (
        isRTL &&
        (currentDirection === 'rtl' || currentDirection === null)
      ) {
        currentSegment += char;
        currentDirection = 'rtl';
      } else {
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
        }
        currentSegment = char;
        currentDirection = isLTR ? 'ltr' : 'rtl';
      }
    }

    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    return segments;
  }

  private wrapText() {
    if (this.contentWidth <= this.innerWidth) {
      return;
    }

    const words = this.textContent.split(/(\s+)/); // Split by any whitespace and keep the delimiter
    let wrappedText = '';
    let currentLine = '';

    for (const word of words) {
      if (word.trim() === '' && currentLine.length === 0) {
        // If it's a whitespace-only word and currentLine is empty, just add the whitespace
        wrappedText += word;
        continue;
      }

      const testLine = currentLine.length === 0 ? word : currentLine + word;
      const testWidth = this.getTextWidth(testLine);

      if (testWidth > this.innerWidth) {
        if (currentLine.length > 0) {
          wrappedText += currentLine + '\n';
        }
        currentLine = word.trim() === '' ? '' : word; // Reset currentLine to word or empty if word is whitespace
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.length > 0) {
      wrappedText += currentLine;
    }

    this.textContent = wrappedText;
  }

  get fontHeight(): number {
    const lineSpacing = 3;
    const fontSize = this.computedStyles.fontSize;
    const height = this.font?.heightAtSize(fontSize);
    // console.log(`font height: ${height}`);
    // console.log(`font size: ${this.computedStyles.fontSize}`);
    if (!height) throw new Error('Font is undefined!');

    return fontSize + lineSpacing;
  }

  getTextWidth(text: string): number {
    const width = text
      .split('\n')
      .map((text) =>
        this.font.widthOfTextAtSize(text, this.computedStyles.fontSize)
      )
      .reduce((max, cur) => (cur > max ? cur : max), 0);

    return width;
  }

  get contentHeight(): number {
    const textHeight = this.textContent.split('\n').length * this.fontHeight;
    return textHeight;
  }

  get contentWidth(): number {
    return this.getTextWidth(this.textContent);
  }

  protected async draw(): Promise<void> {
    const { fontSize, color, textDecoration } = this.computedStyles;
    let { contentY: textY } = this.positionAdjustment;

    textY += this.fontHeight * (0.21 - 1);
    // 0.21 -> for characters under the line (g, q, y, ...)
    // -1 -> to start first line from top instead of bottom

    const lines = this.textContent.split('\n');
    const isParagraphLtr = this.isLTR(this.textContent[0]);
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const segments = this.splitIntoDirectionalSegments(line);
      // console.log(segments);
      const lineYOffset = -this.fontHeight * index;
      const lineWidth = this.getTextWidth(line);
      let textX = this.getCustomContentXAdjustment(lineWidth);

      if (segments.length === 1 || isParagraphLtr) {
        for (const segment of segments) {
          const segmentWidth = this.getTextWidth(segment);

          this.page.drawText(segment, {
            x: this.position.x + textX,
            y: this.position.y + textY + lineYOffset,
            size: fontSize,
            font: this.font!,
            color,
          });
          textX += segmentWidth;
        }
      } else {
        const lineTextWidth = this.getTextWidth(line);
        textX += lineTextWidth;
        for (let index = 0; index < segments.length; index++) {
          let segment = segments[index];
          let segmentWidth = this.getTextWidth(segment);

          if (this.isLTR(segment[0])) {
            {
              // move neutral chars at the end of this segment to the next one
              // to ensure correct directions
              let trailingNeutralChars = '';
              let lastChar = segment[segment.length - 1];
              while (this.isNeutral(lastChar)) {
                segment = segment.slice(0, segment.length - 1);
                trailingNeutralChars = lastChar + trailingNeutralChars;
                lastChar = segment[segment.length - 1];
              }
              if (trailingNeutralChars.length > 0) {
                let nextSegmentIndex = index + 1;
                if (nextSegmentIndex === segments.length) segments.push('');
                segments[nextSegmentIndex] =
                  trailingNeutralChars + segments[nextSegmentIndex];

                segmentWidth = this.getTextWidth(segment);
              }
            }
            this.page.drawText(segment, {
              x: this.position.x + textX - segmentWidth,
              y: this.position.y + textY + lineYOffset,
              size: fontSize,
              font: this.font!,
              color,
            });
            textX -= segmentWidth;
          } else {
            this.page.drawText(segment, {
              x: this.position.x + textX - segmentWidth,
              y: this.position.y + textY + lineYOffset,
              size: fontSize,
              font: this.font!,
              color,
            });
            textX -= segmentWidth;
          }
        }
      }

      if (textDecoration === 'underline') {
        this.page.drawLine({
          start: {
            x: this.position.x + textX - lineWidth,
            y:
              this.position.y +
              this.positionAdjustment.contentY -
              this.fontHeight * 0.9,
          },
          end: {
            x: this.position.x + textX,
            y:
              this.position.y +
              this.positionAdjustment.contentY -
              this.fontHeight * 0.9,
          },
          thickness: 1.3,
          color,
        });
      }
    }
  }

  @Element.UseFallbackFont
  override async preRender(preRenderArgs: {
    x?: number;
    y?: number;
    maxWidth?: number;
  }): Promise<void> {
    super.preRender(preRenderArgs);
    this.wrapText();
    this.setWidth(this.maxWidth, true);
  }
}
