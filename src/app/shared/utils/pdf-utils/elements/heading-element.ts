import { StandardFonts, PDFFont } from 'pdf-lib';
import { Element } from './abstract-element';
import { ParagraphElement } from './paragraph-element';
import { PageDimensions } from './element-styles';

export class HeadingElement extends ParagraphElement {
  level: number;
  constructor(pageDimensions: PageDimensions, level: number) {
    super(pageDimensions);

    this.level = level;
    this.setStyle('font-size', 24 + (6 - level) * 3);
    this.setStyle('color', '#000000');
    this.setStyle('padding', 5);
  }
}
