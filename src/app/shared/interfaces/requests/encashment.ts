import { Item, ItemType } from '../generic-item';

export interface EncashmentRequest extends Item {
  id: string;
  encashName: string;
  encashCode: string;
  value: number;
  date: string;
  remarks: string;
  createDate: string;
  projectCode: string;
  unitPrice: number;
  unitCount: number;
  loanId: string | null;
  original?: EncashmentRequestApi;
}

export interface EncashmentRequestUpdate {
  id: string;
  encashCode?: string;
  date?: string;
  unitPrice?: number;
  unitCount?: number;
  projectCode?: string;
  remarks?: string;
  value: number;
}

export interface EncashmentRequestAdd {
  encashCode: string;
  date: string;
  unitCount: number;
  projectCode: string;
  remarks?: string;

  value: number;
}

export interface EncashmentRequestApi {
  encashID: string;
  u_EmployeeID: string;
  encashName: string;
  value: string;
  date: string;
  status: string;
  remarks: string;
  encashCode: string;
  u_Status: string | null;
  createDate: string;
  u_ApprStatus1: string | null;
  u_ApprStatus2: string | null;
  u_ApprStatus3: string | null;
  projectCode: string;
  unitPrice: string;
  unitCount: string;
  loanID: string | null;
  installmentCount: string | null;
  sortDate: string;
  u_AttachFile: string;
}

export interface EncashmentRequestType extends ItemType {
  code: string;
  name: string;
}

export interface EncashmentRequestUpdateApi {
  docEntry: string;
  u_EmployeeID: string;

  u_EncashType?: string;
  u_Date?: string;
  u_UnitPrice?: string;
  u_UnitCount?: string;
  u_ProjectCode?: string;
  u_Remarks?: string;
  u_Status?: string;

  u_EncashValue?: string;
  u_AttachFile?: string;
}

export interface EncashmentRequestAddApi {
  u_EmployeeID: string;
  u_EncashType: string;
  u_Date: string;
  u_UnitCount: string;
  u_ProjectCode: string;
  u_Remarks?: string;

  u_EncashValue?: string;
  u_UnitPrice?: string;

  u_AttachFile?: string;
  u_ValueTranDocEntry?: string;
  u_Status?: string;
  u_ApprStatus1?: string;
  u_ApprStatus2?: string;
  u_ApprStatus3?: string;
  u_ApprEmpID1?: string;
  u_ApprEmpID2?: string;
  u_ApprEmpID3?: string;
}

export interface EncashmentValue {
  paidVacationValue: number;
}
