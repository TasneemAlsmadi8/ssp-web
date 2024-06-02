export interface ValueTransactionRequest {
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

export enum ValueTransactionRequestStatus {
  Pending = '0',
  Rejected = '1',
  Approved = '2',
  Canceled = '3',
}

export interface ValueTransactionRequestType {
  code: string;
  name: string;
}

export interface ValueTransactionRequestUpdateSchema {
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

export interface ValueTransactionRequestAddSchema {
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
