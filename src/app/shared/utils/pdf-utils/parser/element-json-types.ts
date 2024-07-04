import { Style } from '../elements/element-styles';
import { PageMargins, PageOptions } from '../pdf-builder';

export interface BaseElementJson extends Record<string, any> {
  type: string;
  styles?: Style;
}

export interface HeadingElementJson extends BaseElementJson {
  type: 'heading' | 'h';
  level: number;
  text: string;
}

export interface ParagraphElementJson extends BaseElementJson {
  type: 'paragraph' | 'p';
  text: string;
}

export interface TableCell {
  text: string;
  styles?: Style;
}

export interface TableElementJson extends BaseElementJson {
  type: 'table' | 't';
  data: TableCell[][];
  cellStyles?: Style;
}
type DataRecord = Record<string, string | number | null | undefined>;
export interface ObjectTableElementJson extends BaseElementJson {
  type: 'object-table' | 'o-table' | 'obj-table';
  data: Array<DataRecord> | DataRecord;
  rowHeaders?: boolean;
  headerStyles?: Style;
  cellStyles?: Style;
}

type PercentageString = `${number}%`;
type NumberString = `${number}`;
// Define a pattern for a string that represents a percentage value plus/minus a number
type NumberPercentageString =
  | `${number}%+${number}`
  | `${number}%-${number}`
  | `${number}+${number}%`;

export type MaxWidth = NumberString | PercentageString | NumberPercentageString;

export interface HorizontalContainerElementJson extends BaseElementJson {
  type: 'horizontal-container' | 'h-container';
  widths: MaxWidth[];
  elements: ElementJson[];
}

export interface VerticalContainerElementJson extends BaseElementJson {
  type: 'vertical-container' | 'v-container';
  elements: ElementJson[];
}

export type ElementJson =
  | HeadingElementJson
  | ParagraphElementJson
  | TableElementJson
  | ObjectTableElementJson
  | HorizontalContainerElementJson
  | VerticalContainerElementJson;

export interface PdfJson {
  fileName: string;
  pageOptions?: Partial<PageOptions>;
  styles?: Style;
  template?: {
    name?: string;
    styles?: Style;
    pageMargins?: Partial<PageMargins>;
    variables?: { [key: string]: string | number };
    elements: ElementJson[];
  };
  elements: ElementJson[];
}
