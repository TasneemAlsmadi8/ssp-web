export interface EncashmentRequest {
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

export enum EncashmentRequestStatus {
  Pending = 0,
  Rejected = 1,
  Approved = 2,
  Canceled = 3,
}

export interface EncashmentRequestType {
  code: string;
  name: string;
}

export interface EncashmentRequestUpdateSchema {
  u_EmployeeID?: string;

  docEntry: string;
  u_EncashType?: string;
  u_Date?: string;
  u_UnitPrice?: string;
  u_UnitCount?: string;
  u_ProjectCode?: string;
  u_Remarks?: string;

  u_EncashValue?: string;
  u_AttachFile?: string;
}

export interface EncashmentRequestAddSchema {
  u_EmployeeID: string;
  u_EncashType: string;
  u_Date: string;
  u_UnitPrice: string;
  u_UnitCount: string;
  u_ProjectCode: string;
  u_Remarks?: string;

  u_EncashValue?: string;

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
