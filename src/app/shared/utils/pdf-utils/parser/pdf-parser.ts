import { PdfBuilder } from '../pdf-builder';
import { Element } from '../elements/abstract-element';
import { Width } from '../elements/horizontal-container-element';
import {
  AutoTableElementJson,
  BaseElementJson,
  ComplexDataRecord,
  DataRecord,
  ElementJson,
  HeadingElementJson,
  HorizontalContainerElementJson,
  MaxWidth,
  MultiDataRecords,
  ObjectTableElementJson,
  ParagraphElementJson,
  PdfJson,
  PdfJsonTemplate,
  TableElementJson,
  VerticalContainerElementJson,
} from './element-json-types';
import { ElementFactory } from '../elements/element-factory';
import { PdfPageTemplateBuilder } from '../pdf-page-template';
import { PdfTemplateResolver } from './pdf-template-resolver';
import { formatDateToDisplay } from '../../data-formatter';

export class PdfParser {
  private elementFactory!: ElementFactory;

  constructor() {}

  private async readJSONFile<T = any>(fileName: string): Promise<T> {
    const response = await fetch(fileName);
    const data = await response.json();
    return data as T;
  }

  async parseFromFile(
    jsonFileName: string,
    data: MultiDataRecords | DataRecord[],
    input?: DataRecord,
    additionalVariables?: DataRecord
  ) {
    const pdfJson = await this.readJSONFile<PdfJson>(jsonFileName);

    if (pdfJson.templateFileName) {
      const template = await this.readJSONFile<PdfJsonTemplate>(
        pdfJson.templateFileName
      );
      pdfJson.template = { ...template, ...pdfJson.template };
    }

    return this.parse(pdfJson, data, input, additionalVariables);
  }

  addDataToVariables(
    resolver: PdfTemplateResolver,
    data: MultiDataRecords | DataRecord[]
  ) {
    if (Array.isArray(data) && data.length >= 1) {
      resolver.setVariables({ data: data[0] });
    } else if (!Array.isArray(data)) {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const tableData = data[key];
          if (Array.isArray(tableData) && tableData.length >= 1) {
            const varKey = `data.${key}`;
            resolver.setVariables({ [varKey]: tableData[0] });
          }
        }
      }
    }
  }

  parse(
    pdfJson: PdfJson,
    data: MultiDataRecords | DataRecord[],
    input?: DataRecord,
    additionalVariables?: DataRecord
  ): PdfBuilder {
    const { template, fileName } = pdfJson;
    let { variables, styles, pageOptions } = pdfJson;

    if (!variables)
      variables = {
        date: formatDateToDisplay(new Date().toISOString()),
      };
    else if (!variables['date'])
      variables['date'] = formatDateToDisplay(new Date().toISOString());
    if (input) variables['input'] = input;
    if (additionalVariables)
      variables = { ...variables, ...additionalVariables };

    this.elementFactory = new ElementFactory(pageOptions);

    let templateBuilder: PdfPageTemplateBuilder | undefined;
    if (template) {
      templateBuilder = new PdfPageTemplateBuilder(
        template?.name ?? 'template',
        {
          ...template.pageOptions,
          ...pageOptions,
          ...template.pageMargins,
        }
      );

      if (template.styles) templateBuilder.setStyles(template.styles);
      if (variables) templateBuilder.setVariables(variables);

      if (template.elements)
        for (const elementJson of template.elements) {
          const elem = this.parseElement(elementJson);
          if (elementJson.showBoxes) elem.showBoxes = true;
          templateBuilder.addElement(elem);
        }

      // inherit defaults from template
      pageOptions = {
        ...template.pageOptions,
        ...pageOptions,
      };
      styles = {
        ...template.styles,
        ...styles,
      };
    }

    const builder = new PdfBuilder(fileName, pageOptions, templateBuilder);
    if (styles) builder.setStyles(styles);
    // if (variables) builder.setVariables(variables);

    for (const elementJson of pdfJson.elements) {
      const elem = this.parseElement(elementJson, data, variables);
      if (elementJson.showBoxes) elem.showBoxes = true;
      builder.addElement(elem);
    }
    return builder;
  }

  private parseElement(
    elementJson: ElementJson,
    data?: MultiDataRecords | DataRecord[],
    variables?: ComplexDataRecord
  ): Element {
    const resolver = new PdfTemplateResolver(variables);
    if (data) this.addDataToVariables(resolver, data);

    switch (elementJson.type) {
      case 'heading':
      case 'h':
        if (variables) elementJson = resolver.resolveHeadingJson(elementJson);
        return this.parseHeading(elementJson);
      case 'paragraph':
      case 'p':
        if (variables) elementJson = resolver.resolveParagraphJson(elementJson);
        return this.parseParagraph(elementJson);
      case 'table':
      case 't':
        if (variables) elementJson = resolver.resolveTableJson(elementJson);
        return this.parseTable(elementJson);
      case 'object-table':
      case 'obj-table':
      case 'o-table':
        if (variables)
          elementJson = resolver.resolveObjectTableJson(elementJson);
        return this.parseObjectTable(elementJson);
      case 'auto-table':
      case 'a-table':
        if (!data)
          throw new Error(
            'You Can not use Auto-Table in this context (in templates).'
          );
        return this.parseAutoTable(elementJson, data, variables);
      case 'horizontal-container':
      case 'h-container':
        return this.parseHorizontalContainer(elementJson, data, variables);
      case 'vertical-container':
      case 'v-container':
        return this.parseVerticalContainer(elementJson, data, variables);
      default:
        throw new Error(
          `Unknown element type: ${(elementJson as BaseElementJson).type}}`
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
      headersPlacement,
      hideHeaders,
      headerStyles,
      cellStyles,
      rowStyles,
      columnStyles,
      styles,
      columnsRatio,
    } = elementJson;
    if (!data || typeof data !== 'object')
      throw new Error(
        "ObjectTable element must have a 'data' field of type object"
      );

    if (!(data instanceof Array)) data = [data];

    return this.elementFactory.createTableFromArrayOfObjects(data, {
      headersPlacement,
      hideHeaders,
      headerStyles,
      cellStyles,
      rowStyles,
      columnStyles,
      styles,
      columnsRatio,
    });
  }

  private parseAutoTable(
    elementJson: AutoTableElementJson,
    data: MultiDataRecords | DataRecord[],
    variables?: ComplexDataRecord
  ) {
    let {
      schema,
      tableDataKey,
      headersPlacement,
      hideHeaders,
      headerStyles,
      cellStyles,
      rowStyles,
      columnStyles,
      styles,
      columnsRatio,
    } = elementJson;

    if (!Array.isArray(data)) {
      if (!tableDataKey)
        throw new Error(
          'This report have Multi Table Data!\nPlease provide tableDataKey.\n' +
            `Available Table Data Keys: {${Object.keys(data).join(', ')}}`
        );
      if (!Object.prototype.hasOwnProperty.call(data, tableDataKey))
        throw new Error(
          `'${tableDataKey}' Table Data Key does not exist in this reports data!\n` +
            `Available Table Data Keys: {${Object.keys(data).join(', ')}}`
        );

      data = data[tableDataKey];
    }

    const resolver = new PdfTemplateResolver(variables);
    const tableData = [];
    for (const row of data) {
      resolver.setVariables({ row: row });
      const record: DataRecord = {};
      let serialNumber = 1;
      for (const schemaKey in schema)
        if (Object.prototype.hasOwnProperty.call(schema, schemaKey)) {
          resolver.setVariables({ serialNumber });
          const schemaRowContent = resolver.resolveText(schema[schemaKey]);

          record[schemaKey] = resolver.resolveText(schemaRowContent);
          serialNumber++;
        }

      tableData.push(record);
    }

    // const data: Array<DataRecord> = [];
    return this.elementFactory.createTableFromArrayOfObjects(tableData, {
      headersPlacement,
      hideHeaders,
      headerStyles,
      cellStyles,
      rowStyles,
      columnStyles,
      styles,
      columnsRatio,
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
    data?: MultiDataRecords | DataRecord[],
    variables?: ComplexDataRecord
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
      container.addElement(this.parseElement(elementJson, data, variables), {
        maxWidth: this.mapStringToWidth(maxWidth),
      });
    }
    return container;
  }

  private parseVerticalContainer(
    elementJson: VerticalContainerElementJson,
    data?: MultiDataRecords | DataRecord[],
    variables?: ComplexDataRecord
  ) {
    const { styles, elements } = elementJson;
    if (!elements || !Array.isArray(elements))
      throw new Error(
        "VerticalContainer element must have an 'elements' field of type array"
      );

    const container = this.elementFactory.createVerticalContainer({
      styles,
    });
    for (const elementJson of elements) {
      container.addElement(this.parseElement(elementJson, data, variables));
    }
    return container;
  }
}
