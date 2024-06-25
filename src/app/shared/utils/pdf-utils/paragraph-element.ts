import { PDFFont } from 'pdf-lib';
import { Element } from './abstract-element';

export class ParagraphElement extends Element {
  textContent: string;
  constructor() {
    super();
    this.textContent = '';
    this.setStyle('font-size', 14);
    this.setStyle('color', '#000000');
    this.setStyle('padding', 2);
  }
  setTextContent(text: string) {
    this.textContent = text;
  }

  get fontHeight(): number {
    const height = this.font?.heightAtSize(this.computedStyles.fontSize);
    if (!height) throw new Error('Font is undefined!');

    return height;
  }

  get textWidth(): number {
    const width = this.textContent
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
    return this.textWidth; // TODO: check if this take \n in consideration
  }

  protected async draw(): Promise<void> {
    const { fontSize, color } = this.computedStyles;
    let { contentX: textX, contentY: textY } = this.positionAdjustment;

    textY -= this.fontHeight * 0.79; // for characters under the line (g, q, y, ...)
    // textY += this.contentHeight - this.fontHeight; // to start first line from top instead of bottom

    const lines = this.textContent.split('\n');

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const lineOffset = -fontSize * index;
      this.page.drawText(line, {
        x: this.position.x + textX,
        y: this.position.y + textY + lineOffset,
        size: fontSize,
        font: this.font!,
        color,
      });
    }
  }
}
