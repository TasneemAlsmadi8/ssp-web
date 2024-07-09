import { ItemType } from '../generic-item';

export interface HourlyTransactionReport {
  employeeCode: string;
  fullName: string;
  transactionCode: string;
  transactionName: string;
  fromDate: string;
  toDate: string;
  numberOfHours?: number;
  overtimeHours: number;
  remarks?: string;
  batchNumber: string;
}

export interface HourlyTransactionReportInput {
  transactionType: string;
  fromDate: string;
  toDate: string;
}

export interface HourlyTransactionType extends ItemType {
  code: string;
  name: string;
}

export interface HourlyTransactionReportApi {
  empCode: string;
  fullName: string;
  tranCode: string;
  tranName: string;
  u_FromDate: string;
  u_ToDate: string;
  noOfHours: null | string;
  overtimeHours: string;
  u_Remarks: null | string;
  u_BatchNo: string;
}
