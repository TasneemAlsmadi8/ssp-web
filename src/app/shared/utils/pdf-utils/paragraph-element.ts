import { PDFFont } from 'pdf-lib';
import { Element } from './abstract-element';

export class ParagraphElement extends Element {
  textContent: string;
  constructor() {
    super();
    this.textContent = '';
    this.setStyle('font-size', 12);
    this.setStyle('color', '#000000');
    this.setStyle('padding', 2);
  }
  setTextContent(text: string) {
    this.textContent = text;
  }

  private wrapText() {
    if (this.contentWidth <= this.innerWidth) {
      return;
    }

    const words = this.textContent.split(' ');
    let wrappedText = '';
    let currentLine = '';

    for (const word of words) {
      const testLine =
        currentLine.length === 0 ? word : currentLine + ' ' + word;
      const testWidth = this.getTextWidth(testLine);

      if (testWidth > this.innerWidth) {
        if (currentLine.length > 0) {
          wrappedText += currentLine + '\n';
        }
        currentLine = word;
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
    const height = this.font?.heightAtSize(this.computedStyles.fontSize);
    if (!height) throw new Error('Font is undefined!');

    return height;
  }

  getTextWidth(text: string): number {
    const width = text
      .split('\n')
      .map((text) => {
        return this.font.widthOfTextAtSize(text, this.computedStyles.fontSize);
      })
      .reduce((max, cur) => (cur > max ? cur : max), 0);

    return width;
  }

  get contentHeight(): number {
    const lineSpacing = 2;
    const textHeight =
      this.textContent.split('\n').length * (this.fontHeight + lineSpacing);
    return textHeight;
  }

  get contentWidth(): number {
    return this.getTextWidth(this.textContent);
  }

  protected async draw(): Promise<void> {
    const { fontSize, color } = this.computedStyles;
    let { contentY: textY } = this.positionAdjustment;

    textY += this.fontHeight * (0.21 - 1);
    // 0.21 -> for characters under the line (g, q, y, ...)
    // -1 -> to start first line from top instead of bottom

    const lines = this.textContent.split('\n');

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const lineOffset = -fontSize * index;
      let textX = this.calculateContentXAdjustment(this.getTextWidth(line));
      // to apply alignment on each line separately

      this.page.drawText(line, {
        x: this.position.x + textX,
        y: this.position.y + textY + lineOffset,
        size: fontSize,
        font: this.font!,
        color,
      });
    }
  }

  override async preRender(preRenderArgs: {
    x?: number;
    y?: number;
    maxWidth?: number;
  }): Promise<void> {
    super.preRender(preRenderArgs);
    this.wrapText();
  }
}
