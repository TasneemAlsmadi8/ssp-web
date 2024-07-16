import { ChildrenStylesSelectors, Style } from '../elements/element-styles';
import { PageMargins, PageOptions } from '../elements/element-styles';

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
  rowStyles?: ChildrenStylesSelectors;
  columnStyles?: ChildrenStylesSelectors;
}

export type DataRecord = Record<string, string | number | null | undefined>;
export type ComplexDataRecord = Record<
  string,
  string | number | null | undefined | DataRecord
>;
export type MultiDataRecords = Record<string, DataRecord[]>;

export interface ObjectTableElementJson extends BaseElementJson {
  type: 'object-table' | 'o-table' | 'obj-table';
  data: Array<DataRecord> | DataRecord;
  rowHeaders?: boolean;
  headerStyles?: Style;
  cellStyles?: Style;
  rowStyles?: ChildrenStylesSelectors;
  columnStyles?: ChildrenStylesSelectors;
}

export type HeaderTitle = string;
export type DataFieldKey = string;
export interface AutoTableElementJson extends BaseElementJson {
  type: 'auto-table' | 'a-table';
  schema: Record<HeaderTitle, DataFieldKey>;
  tableDataKey?: string;
  rowHeaders?: boolean;
  headerStyles?: Style;
  cellStyles?: Style;
  rowStyles?: ChildrenStylesSelectors;
  columnStyles?: ChildrenStylesSelectors;
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
  | AutoTableElementJson
  | HorizontalContainerElementJson
  | VerticalContainerElementJson;

export type PdfJsonTemplate = {
  name?: string;
  pageOptions?: Partial<PageOptions>;
  styles?: Style;
  variables?: ComplexDataRecord;
  elements: ElementJson[];
};

export interface PdfJson {
  name: string;
  pageOptions?: Partial<PageOptions>;
  styles?: Style;
  variables?: ComplexDataRecord;
  template?: PdfJsonTemplate;
  elements: ElementJson[];
}
