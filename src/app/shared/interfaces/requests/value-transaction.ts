import { ItemType } from '../generic-item';

export interface ValueTransactionRequest {
  id: string;
  valueTranName: string;
  valueTranCode: string;
  value: number;
  date: string;
  createDate: string;
  projectCode: string;
  status: string;
  remarks: string;
}

export interface ValueTransactionRequestUpdate {
  id: string;
  valueTranCode?: string;
  value?: number;
  date?: string;
  projectCode?: string;
  remarks?: string;
}

export interface ValueTransactionRequestAdd {
  valueTranCode: string;
  value: number;
  date: string;
  projectCode: string;
  remarks?: string;
}

export interface ValueTransactionRequestApi {
  valueTranID: string;
  u_EmployeeID: string;
  valueTranName: string;
  value: string;
  date: string;
  status: string;
  remarks: string;
  valueTranCode: string;
  u_Status: string | null;
  createDate: string;
  u_ApprStatus1: string | null;
  u_ApprStatus2: string | null;
  u_ApprStatus3: string | null;
  projectCode: string;
  sortDate: string;
}

export interface ValueTransactionRequestType extends ItemType {
  code: string;
  name: string;
}

export interface ValueTransactionRequestUpdateApi {
  u_EmployeeID?: string;

  docEntry: string;
  u_ValueTranType?: string;
  u_TranValue?: string;
  u_Date?: string;
  u_ProjectCode?: string;
  u_Remarks?: string;

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

export interface ValueTransactionRequestAddApi {
  docEntry?: string;

  u_EmployeeID: string;
  u_ValueTranType: string;
  u_TranValue: string;
  u_Date: string;
  u_ProjectCode: string;
  u_Remarks?: string;

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
