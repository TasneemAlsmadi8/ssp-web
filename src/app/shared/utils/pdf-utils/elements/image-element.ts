import { PDFDocument, PDFImage, PDFPage, rgb } from 'pdf-lib';
import { Element } from './abstract-element';
import { ComputedStyles } from './element-styles';

export class ImageElement extends Element {
  imageUrl: string;
  imageBytes: Uint8Array | undefined;

  constructor(imageUrl: string) {
    super();
    this.imageUrl = imageUrl;
    this.imageBytes = undefined;
  }

  async loadImageBytes(): Promise<void> {
    const response = await fetch(this.imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    this.imageBytes = new Uint8Array(arrayBuffer);
  }

  get innerHeight(): number {
    // Adjust as needed based on image aspect ratio
    return 200;
  }

  get height(): number {
    const marginTop = this.styles['margin-top'] ?? 0;
    const marginBottom = this.styles['margin-bottom'] ?? 0;
    return this.innerHeight + marginTop + marginBottom;
  }

  async draw(page: PDFPage, x: number, y: number, styles: ComputedStyles) {
    if (!this.imageBytes) {
      await this.loadImageBytes();
    }
    const embeddedImage = await page.doc.embedPng(this.imageBytes!);
    const imageWidth =
      embeddedImage.width * (this.innerHeight / embeddedImage.height);

    // Draw background if background color is set
    if (styles.backgroundColor !== rgb(1, 1, 1)) {
      page.drawRectangle({
        x: x + styles.boxX,
        y: y + styles.boxY,
        width: imageWidth + styles.padding * 2,
        height: this.innerHeight + styles.padding * 2,
        color: styles.backgroundColor,
      });
    }

    page.drawImage(embeddedImage, {
      x: x + styles.textX + styles.padding,
      y: y + styles.textY - styles.padding - this.innerHeight,
      width: imageWidth,
      height: this.innerHeight,
      opacity: 1,
    });
  }
}
