import { rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { Element, ComputedStyles } from './abstract-element';

export class ParagraphElement extends Element {
  constructor() {
    super();
    this.setStyle('font-size', 14);
    this.setStyle('color', '#000000');
    this.setStyle('padding', 2);
  }

  get innerHeight(): number {
    const textHeight =
      this.textContent.split('\n').length * this.computedStyles.fontSize;
    // debugger
    return (
      textHeight +
      this.computedStyles.paddingTop +
      this.computedStyles.paddingBottom
    );
  }

  get innerWidth(): number {
    return (
      this.parentWidth -
      this.computedStyles.marginLeft -
      this.computedStyles.marginRight
    );
  }

  async draw(x: number, y: number) {
    const font: PDFFont = await this.page.doc.embedFont(
      StandardFonts.Helvetica
    );
    const { fontSize, color } = this.computedStyles;
    const { textX, textY } = this.positionAdjustment;

    const lines = this.textContent.split('\n');

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const lineOffset = -fontSize * index;
      this.page.drawText(line, {
        x: x + textX,
        y: y + textY + lineOffset,
        size: fontSize,
        font,
        color,
      });
    }
  }
}
