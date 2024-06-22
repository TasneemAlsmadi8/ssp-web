import { rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { Element, ComputedStyles } from './abstract-element';

export class HeadingElement extends Element {
  level: number;

  constructor(level: number) {
    super();
    this.level = level;
    this.setStyle('font-size', 24 + (6 - level) * 3);
    this.setStyle('color', '#000000');
    this.setStyle('padding', 5);
  }

  get innerHeight(): number {
    const fontSize = this.styles['font-size'] ?? 14;
    const padding = this.styles['padding'] ?? 0;

    return fontSize + padding * 2; // fontSize -> should use heightAtSize
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

    page.drawText(this.textContent, {
      x: x + styles.textX,
      y: y + styles.textY,
      size: styles.fontSize,
      font,
      color: styles.color,
    });
  }
}
