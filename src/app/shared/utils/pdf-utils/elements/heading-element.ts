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
}
