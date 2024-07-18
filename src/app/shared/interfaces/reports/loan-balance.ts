import { DataRecord } from '../../utils/pdf-utils/parser/element-json-types';

export interface LoanBalanceReport extends DataRecord {
  employeeId: string;
  employeeCode: string;
  transactionDate: string;
  transactionValue: number;
  remarks: string;
  paidTran: string;
  loanAmount: number;
  startDate: string;
  settlementCount: number;
  loanBalance: number;
  multiTranID: string;
  name: string;
  loanName: string;
  loanRemarks: string;
  batchNumber?: string;
  locked: string;
  fullName: string;
  fullNameF: string;
  docEntry: string;
}

export interface LoanBalanceReportApi {
  u_EmpCode: string;
  u_TransactionDate: string;
  u_TransactionValue: string;
  u_Remarks: null | string;
  u_PaidTran: string;
  u_LoanAmount: string;
  u_StartDate: string;
  u_SettlementCount: string;
  u_LoanBalance: string;
  empID: string;
  u_MultiTranID: string;
  name: null | string;
  loanName: string;
  loan_Remarks: null | string;
  u_BatchNo: null | string;
  u_Locked: string;
  u_FullName: string;
  u_FullNameF: string;
  docEntry: string;
}
