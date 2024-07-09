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
import { PdfTemplateBuilder } from '../pdf-template-builder';

export class PdfParser {
  private builder!: PdfBuilder;

  constructor() {}

  parse(pdfJson: PdfJson): PdfBuilder {
    const { template, fileName, pageOptions, styles } = pdfJson;

    let templateBuilder: PdfTemplateBuilder | undefined;
    if (template) {
      templateBuilder = new PdfTemplateBuilder(template?.name, {
        ...pageOptions,
        ...template.pageMargins,
      });
      this.builder = templateBuilder;

      if (template.styles) this.builder.setStyles(template.styles);
      if (template?.variables)
        templateBuilder.addVariables(template?.variables);

      for (const elementJson of template.elements) {
        this.parseElement(elementJson);
      }
    }

    this.builder = new PdfBuilder(fileName, pageOptions, templateBuilder);
    if (styles) this.builder.setStyles(styles);

    for (const elementJson of pdfJson.elements) {
      this.parseElement(elementJson);
    }
    return this.builder;
  }

  private parseElement(elementJson: ElementJson, standalone = false): Element {
    switch (elementJson.type) {
      case 'heading':
      case 'h':
        return this.parseHeading(elementJson, standalone);
      case 'paragraph':
      case 'p':
        return this.parseParagraph(elementJson, standalone);
      case 'table':
      case 't':
        return this.parseTable(elementJson, standalone);
      case 'object-table':
      case 'obj-table':
      case 'o-table':
        return this.parseObjectTable(elementJson, standalone);
      case 'horizontal-container':
      case 'h-container':
        return this.parseHorizontalContainer(elementJson, standalone);
      case 'vertical-container':
      case 'v-container':
        return this.parseVerticalContainer(elementJson, standalone);
      default:
        throw new Error(
          `Unknown element type: ${(elementJson as BaseElementJson).type}`
        );
    }
  }
  private parseHeading(
    elementJson: HeadingElementJson,
    standalone: boolean = false
  ) {
    const { level, text, styles } = elementJson;
    if (!text) throw new Error("Heading element must have a 'text' field");
    if (!level) throw new Error("Heading element must have a 'level' field");

    return this.builder.createHeading(level, text, { styles, standalone });
  }

  private parseParagraph(
    elementJson: ParagraphElementJson,
    standalone: boolean = false
  ) {
    const { text, styles } = elementJson;
    if (!text) throw new Error("Paragraph element must have a 'text' field");

    return this.builder.createParagraph(text, { styles, standalone });
  }

  private parseTable(
    elementJson: TableElementJson,
    standalone: boolean = false
  ) {
    const { data, styles, cellStyles, rowStyles, columnStyles } = elementJson;
    if (!data || !Array.isArray(data))
      throw new Error("Table element must have a 'data' field of type array");

    return this.builder.createTable(data, {
      styles,
      cellStyles,
      rowStyles,
      columnStyles,
      standalone,
    });
  }
  private parseObjectTable(
    elementJson: ObjectTableElementJson,
    standalone: boolean = false
  ) {
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

    return this.builder.createTableFromArrayOfObjects(data, {
      rowHeaders,
      headerStyles,
      cellStyles,
      rowStyles,
      columnStyles,
      styles,
      standalone,
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
    elementJson: HorizontalContainerElementJson,
    standalone: boolean = false
  ) {
    const { styles, elements, widths } = elementJson;
    if (!elements || !Array.isArray(elements))
      throw new Error(
        "HorizontalContainer element must have an 'elements' field of type array"
      );

    const container = this.builder.createHorizontalContainer({
      styles,
      standalone,
    });
    for (let index = 0; index < elements.length; index++) {
      const elementJson = elements[index];
      const maxWidth = widths[index];
      container.addElement(this.parseElement(elementJson, true), {
        maxWidth: this.mapStringToWidth(maxWidth),
      });
    }
    return container;
  }

  private parseVerticalContainer(
    elementJson: VerticalContainerElementJson,
    standalone: boolean = false
  ) {
    const { styles, elements } = elementJson;
    if (!elements || !Array.isArray(elements))
      throw new Error(
        "VerticalContainer element must have an 'elements' field of type array"
      );

    const container = this.builder.createVerticalContainer({
      styles,
      standalone,
    });
    for (const elementJson of elements) {
      container.addElement(this.parseElement(elementJson, true));
    }
    return container;
  }
}
