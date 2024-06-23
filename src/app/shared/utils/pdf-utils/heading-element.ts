import { StandardFonts, PDFFont } from 'pdf-lib';
import { Element } from './abstract-element';
import { ParagraphElement } from './paragraph-element';

export class HeadingElement extends ParagraphElement {
  level: number;

  constructor(level: number) {
    super();
    this.level = level;
    this.setStyle('font-size', 24 + (6 - level) * 3);
    this.setStyle('color', '#000000');
    this.setStyle('padding', 5);
  }

  // get innerHeight(): number {
  //   return (
  //     this.computedStyles.fontSize +
  //     this.computedStyles.paddingTop +
  //     this.computedStyles.paddingBottom
  //   ); // fontSize -> should use heightAtSize
  // }
  // get innerWidth(): number {
  //   return (
  //     this.parentWidth -
  //     this.computedStyles.marginLeft -
  //     this.computedStyles.marginRight
  //   );
  // }

  // async draw(x: number, y: number) {
  //   const font: PDFFont = await this.page.doc.embedFont(
  //     StandardFonts.Helvetica
  //   );

  //   this.page.drawText(this.textContent, {
  //     x: x ,//+ this.positionAdjustment.textX,
  //     y: y ,//+ this.positionAdjustment.textY,
  //     size: this.computedStyles.fontSize,
  //     font,
  //     color: this.computedStyles.color,
  //   });
  // }
}
