import { ParagraphElement } from './paragraph-element';
import { PageOptions } from './element-styles';

export class HeadingElement extends ParagraphElement {
  level: number;
  constructor(pageOptions: PageOptions, level: number) {
    super(pageOptions);

    this.level = level;
    this.setStyle('font-size', 24 + (6 - level) * 3);
    this.setStyle('color', '#000000');
    this.setStyle('padding', 5);
  }

  override clone(): HeadingElement {
    const cloned = super.clone() as HeadingElement;
    cloned.level = this.level;
    return cloned;
  }
}
