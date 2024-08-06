import { Item, ItemType } from '../generic-item';

export interface LoanRequest extends Item {
  id: string;
  dateSubmitted: string | null;
  loanCode: string;
  loanName: string | null;
  totalAmount: number;
  installmentCount: number;
  startDate: string;
  remarks?: string;
}
export interface LoanRequestUpdate {
  id: string;
  loanCode?: string;
  totalAmount?: number;
  installmentCount?: number;
  startDate?: string;
  remarks?: string;
}

export interface LoanRequestAdd {
  loanCode: string;
  totalAmount: number;
  installmentCount: number;
  startDate: string;
  remarks?: string;
}

export interface LoanRequestApi {
  loanID: string;
  dateSubmitted: string | null;
  empID: string | null;
  loanCode: string;
  empCode: string | null;
  fullName: string | null;
  fullNameF: string | null;
  loanName: string | null;
  totalAmount: string;
  installmentCount: string;
  startDate: string;
  statusID: string | null;
  status: string;
  remarks: string | null;
}

export interface LoanRequestType extends ItemType {
  code: string;
  name: string;
}

export interface LoanRequestUpdateApi {
  docEntry: string;
  u_EmployeeID: number;
  u_LoanType?: string;
  u_TotalAmount?: string;
  u_InstallmentCount?: string;
  u_StartDate?: string;
  u_Remarks?: string;
  u_AttachFile?: string;
  u_LoanTranDocEntry?: string;
  u_Status?: string;
  u_ApprStatus1?: string;
  u_ApprStatus2?: string;
  u_ApprStatus3?: string;
  u_ApprEmpID1?: string;
  u_ApprEmpID2?: string;
  u_ApprEmpID3?: string;
}

export interface LoanRequestAddApi {
  docEntry?: string;

  u_EmployeeID: number;
  u_LoanType: string;
  u_TotalAmount: string;
  u_InstallmentCount: string;
  u_StartDate: string;
  u_Remarks?: string;

  u_Status?: string;
  u_AttachFile?: string;
  u_LoanTranDocEntry?: string;
  u_ApprStatus1?: string;
  u_ApprStatus2?: string;
  u_ApprStatus3?: string;
  u_ApprEmpID1?: string;
  u_ApprEmpID2?: string;
  u_ApprEmpID3?: string;
}
