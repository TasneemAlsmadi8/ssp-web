import { DataRecord } from '../../utils/pdf-utils/parser/element-json-types';

export interface ValueTransactionReport extends DataRecord {
  empCode: string;
  fullName: string;
  tranCode: string;
  tableName: string;
  tranName: string;
  tranDate: string; // Date (YYYY-MM-DDTHH:MM:SS)
  value: string; // Value as decimal string
  u_Remarks: string;
  u_BatchNo: null | string;
}

export interface ValueTransactionReportInput extends DataRecord {
  transactionType: string;
  fromDate: string;
  toDate: string;
}
