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
    const height = this.font?.widthOfTextAtSize(
      this.textContent,
      this.computedStyles.fontSize
    );
    if (!height) throw new Error('Font is undefined!');

    console.log(height);
    return height;
  }

  get contentHeight(): number {
    const textHeight =
      this.textContent.split('\n').length * this.fontHeight + 2;
    // debugger
    return textHeight;
  }

  get contentWidth(): number {
    return this.textWidth; // TODO: check if this take \n in consideration
  }

  protected async draw(): Promise<void> {
    const { fontSize, color } = this.computedStyles;
    const { contentX: textX, contentY: textY } = this.positionAdjustment;

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
