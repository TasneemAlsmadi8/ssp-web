import { PdfBuilder } from '../pdf-builder';
import { Element } from '../elements/abstract-element';
import { Width } from '../elements/horizontal-container-element';
import {
  BaseElementJson,
  ElementJson,
  HeadingElementJson,
  HorizontalContainerElementJson,
  MaxWidth,
  ObjectTableElementJson,
  ParagraphElementJson,
  PdfJson,
  TableElementJson,
  VerticalContainerElementJson,
} from './element-json-types';
import { ElementFactory } from '../elements/element-factory';
import { PdfPageTemplateBuilder } from '../pdf-page-template';

export class PdfParser {
  private elementFactory!: ElementFactory;

  constructor() {}

  parse(pdfJson: PdfJson): PdfBuilder {
    const { template, fileName, pageOptions, styles, variables } = pdfJson;

    this.elementFactory = new ElementFactory(pageOptions);

    let templateBuilder: PdfPageTemplateBuilder | undefined;
    if (template) {
      templateBuilder = new PdfPageTemplateBuilder(
        template?.name ?? 'template',
        {
          ...pageOptions,
          ...template.pageMargins,
        }
      );

      if (template.styles) templateBuilder.setStyles(template.styles);
      if (variables) templateBuilder.setVariables(variables);

      for (const elementJson of template.elements) {
        templateBuilder.addElement(this.parseElement(elementJson));
      }
    }

    const builder = new PdfBuilder(fileName, pageOptions, templateBuilder);
    if (styles) builder.setStyles(styles);
    // if (variables) builder.setVariables(variables);

    for (const elementJson of pdfJson.elements) {
      builder.addElement(this.parseElement(elementJson));
    }
    return builder;
  }

  private parseElement(elementJson: ElementJson): Element {
    switch (elementJson.type) {
      case 'heading':
      case 'h':
        return this.parseHeading(elementJson);
      case 'paragraph':
      case 'p':
        return this.parseParagraph(elementJson);
      case 'table':
      case 't':
        return this.parseTable(elementJson);
      case 'object-table':
      case 'obj-table':
      case 'o-table':
        return this.parseObjectTable(elementJson);
      case 'horizontal-container':
      case 'h-container':
        return this.parseHorizontalContainer(elementJson);
      case 'vertical-container':
      case 'v-container':
        return this.parseVerticalContainer(elementJson);
      default:
        throw new Error(
          `Unknown element type: ${(elementJson as BaseElementJson).type}`
        );
    }
  }
  private parseHeading(elementJson: HeadingElementJson) {
    const { level, text, styles } = elementJson;
    if (!text) throw new Error("Heading element must have a 'text' field");
    if (!level) throw new Error("Heading element must have a 'level' field");

    return this.elementFactory.createHeading(level, text, { styles });
  }

  private parseParagraph(elementJson: ParagraphElementJson) {
    const { text, styles } = elementJson;
    if (!text) throw new Error("Paragraph element must have a 'text' field");

    return this.elementFactory.createParagraph(text, { styles });
  }

  private parseTable(elementJson: TableElementJson) {
    const { data, styles, cellStyles, rowStyles, columnStyles } = elementJson;
    if (!data || !Array.isArray(data))
      throw new Error("Table element must have a 'data' field of type array");

    return this.elementFactory.createTable(data, {
      styles,
      cellStyles,
      rowStyles,
      columnStyles,
    });
  }
  private parseObjectTable(elementJson: ObjectTableElementJson) {
    let {
      data,
      rowHeaders,
      headerStyles,
      cellStyles,
      rowStyles,
      columnStyles,
      styles,
    } = elementJson;
    if (!data || typeof data !== 'object')
      throw new Error(
        "ObjectTable element must have a 'data' field of type object"
      );

    if (!(data instanceof Array)) data = [data];

    return this.elementFactory.createTableFromArrayOfObjects(data, {
      rowHeaders,
      headerStyles,
      cellStyles,
      rowStyles,
      columnStyles,
      styles,
    });
  }

  private mapStringToWidth(maxWidth: MaxWidth): Width {
    if (maxWidth.endsWith('%')) {
      return {
        percent: parseFloat(maxWidth.replace('%', '')),
      };
    }
    let match = maxWidth.match(/^-?\d+(\.\d+)?$/);
    if (match) {
      const [pixels] = match;
      return {
        pixels: parseFloat(pixels),
      };
    }

    match = maxWidth.match(/^(\d+)%([+-])(\d+)$/);
    if (match) {
      const [, percent, sign, pixels] = match;
      return {
        percent: parseFloat(percent),
        pixels: parseInt(pixels, 10) * (sign === '-' ? -1 : 1),
      };
    }

    match = maxWidth.match(/^(\d+)+(\d+)%$/);
    if (match) {
      const [, pixels, percent] = match;
      return {
        pixels: parseInt(pixels, 10),
        percent: parseFloat(percent),
      };
    }

    throw new Error(`Invalid max-width format: ${maxWidth}`);
  }

  private parseHorizontalContainer(
    elementJson: HorizontalContainerElementJson
  ) {
    const { styles, elements, widths } = elementJson;
    if (!elements || !Array.isArray(elements))
      throw new Error(
        "HorizontalContainer element must have an 'elements' field of type array"
      );

    const container = this.elementFactory.createHorizontalContainer({
      styles,
    });
    for (let index = 0; index < elements.length; index++) {
      const elementJson = elements[index];
      const maxWidth = widths[index];
      container.addElement(this.parseElement(elementJson), {
        maxWidth: this.mapStringToWidth(maxWidth),
      });
    }
    return container;
  }

  private parseVerticalContainer(elementJson: VerticalContainerElementJson) {
    const { styles, elements } = elementJson;
    if (!elements || !Array.isArray(elements))
      throw new Error(
        "VerticalContainer element must have an 'elements' field of type array"
      );

    const container = this.elementFactory.createVerticalContainer({
      styles,
    });
    for (const elementJson of elements) {
      container.addElement(this.parseElement(elementJson));
    }
    return container;
  }
}
