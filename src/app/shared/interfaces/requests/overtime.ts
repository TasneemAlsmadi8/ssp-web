export interface OvertimeRequest {
  overtimeID: string;
  u_EmployeeID: string;
  overtimeType: string;
  fromDate: string;
  toDate: string;
  statusTypeId: string;
  fromTime: string | null;
  toTime: string | null;
  status: string;
  overtimeCode: string;
  u_Status: string | null;
  u_ApprStatus1: string | null;
  u_ApprStatus2: string | null;
  u_ApprStatus3: string | null;
  ovHours: string;
  hour: number;
  minute: number;
  remarks: string;
  projectCode: string;
  projectName: string;
  sortFromDate: string;
  sortToDate: string;
  u_AttachFile: string | null;
}

export enum OvertimeRequestStatus {
  Pending = 0,
  Rejected = 1,
  Approved = 2,
  Canceled = 3,
}

export interface OvertimeRequestType {
  code: string;
  name: string;
}

export interface OvertimeRequestUpdateSchema {
  docEntry: string;
  u_EmployeeID?: string;
  u_OvType?: string;
  u_FromDate?: string;
  u_ToDate?: string;
  u_OvHour?: string;
  u_OvMin?: string;
  u_ProjectCode?: string;
  u_Remarks?: string;
  u_AttachFile?: string;
  u_HourTranDocEntry?: string;
  u_Status?: string;
  u_ApprStatus1?: string;
  u_ApprStatus2?: string;
  u_ApprStatus3?: string;
  u_ApprEmpID1?: string;
  u_ApprEmpID2?: string;
  u_ApprEmpID3?: string;
}

export interface OvertimeRequestAddSchema {
  docEntry?: string;

  u_EmployeeID: string;
  u_OvType: string;
  u_FromDate: string;
  u_ToDate: string;
  u_OvHour: string;
  u_OvMin: string;
  u_ProjectCode: string;
  u_Remarks: string;

  u_AttachFile?: string;
  u_HourTranDocEntry?: string;
  u_Status?: string;
  u_ApprStatus1?: string;
  u_ApprStatus2?: string;
  u_ApprStatus3?: string;
  u_ApprEmpID1?: string;
  u_ApprEmpID2?: string;
  u_ApprEmpID3?: string;
}
