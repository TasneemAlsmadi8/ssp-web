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
    const fontSize = this.styles['font-size'] ?? 14;
    const padding = this.styles['padding'] ?? 0;

    const textHeight = this.textContent.split('\n').length * fontSize;

    return textHeight + padding * 2;
  }

  get height(): number {
    const marginTop = this.styles['margin-top'] ?? 0;
    const marginBottom = this.styles['margin-bottom'] ?? 0;

    return this.innerHeight + marginTop + marginBottom;
  }

  async draw(page: PDFPage, x: number, y: number, styles: ComputedStyles) {
    const font: PDFFont = await page.doc.embedFont(StandardFonts.Helvetica);

    // Draw background if background color is set
    if (styles.backgroundColor !== rgb(1, 1, 1)) {
      // not white
      page.drawRectangle({
        x: x + styles.boxX,
        y: y + styles.boxY,
        width: page.getWidth() - 100,
        height: this.innerHeight,
        color: styles.backgroundColor,
      });
    }
    const lines = this.textContent.split('\n');
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      page.drawText(line, {
        x: x + styles.textX,
        y: y + styles.textY - styles.fontSize * index,
        size: styles.fontSize,
        font,
        color: styles.color,
      });
    }
  }
}
