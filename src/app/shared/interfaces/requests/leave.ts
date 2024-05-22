export interface LeaveRequest {
  leaveID: string;
  u_EmployeeID: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  statusTypeId: string;
  fromTime: string | null;
  toTime: string | null;
  status: string;
  remarks: string | null;
  leaveCode: string;
  u_Status: string;
  u_ApprStatus1: string;
  u_ApprStatus2: string | null;
  u_ApprStatus3: string | null;
  u_PaidDays: string;
  u_UnpaidDays: string;
  u_AttachFile: string;
  sortFromDate: string;
  sortToDate: string;
}

export interface LeaveRequestGetById {
  docEntry: string;
  docNum: string;
  period: string;
  instance: string;
  series: string;
  handwrtten: string;
  canceled: string;
  object: string;
  logInst: string | null;
  userSign: string;
  transfered: string;
  status: string;
  createDate: string;
  createTime: string;
  updateDate: string;
  updateTime: string | null;
  dataSource: string;
  requestStatus: string;
  creator: string;
  remark: string | null;
  u_EmployeeID: string;
  u_LeaveType: string;
  u_FromDate: string;
  u_ToDate: string;
  u_FromTime: string;
  u_ToTime: string;
  u_Remarks: string;
  u_Status: string;
  u_AlterEmpID: string | null;
  u_ApprStatus1: string;
  u_ApprStatus2: string;
  u_ApprStatus3: string;
  u_LeaveTranDocEntry: string;
  u_PaidDays: string;
  u_UnpaidDays: string;
  u_AttachFile: string;
  u_LeaveBalance: string;
  u_ApprEmpID1: string;
  u_ApprEmpID2: string;
  u_ApprEmpID3: string;
}

export interface LeaveRequestUpdateSchema {
  docEntry: string;

  //edit for pending
  u_LeaveType?: string;
  u_FromDate?: string;
  u_ToDate?: string;
  u_FromTime?: string;
  u_ToTime?: string;
  u_Remarks?: string;

  // //static
  // u_EmployeeID?: string;
  // u_PaidDays?: number;
  // u_UnpaidDays?: number;

  // // static
  // u_LeaveBalance?: number;

  // //edit on cancel
  // u_Status?: string;

  //unused
  // u_AttachFile?: string;
  // u_LeaveTranDocEntry?: string;
  // u_ApprStatus1?: string;
  // u_ApprStatus2?: string;
  // u_ApprStatus3?: string;
  // u_ApprEmpID1?: string;
  // u_ApprEmpID2?: string;
  // u_ApprEmpID3?: string;
}

export interface LeaveRequestType {
  code: string;
  name: string;
}

export enum LeaveRequestStatus {
  Pending = 0,
  Rejected = 1,
  Approved = 2,
  Canceled = 3,
}

export interface LeaveRequestAddSchema {
  docEntry?: string;
  // actually used:
  u_EmployeeID: string;
  u_LeaveType: string;
  u_FromDate: string;
  u_ToDate: string;
  u_FromTime: string;
  u_ToTime: string;
  u_Remarks?: string;

  u_PaidDays?: number;
  u_UnpaidDays?: number;
  u_LeaveBalance?: number;
  u_AttachFile?: string;
  u_LeaveTranDocEntry?: string;
  u_Status?: string;
  u_ApprStatus1?: string;
  u_ApprStatus2?: string;
  u_ApprStatus3?: string;
  u_ApprEmpID1?: string;
  u_ApprEmpID2?: string;
  u_ApprEmpID3?: string;
}

export interface LeaveRequestBalance {
  empID: number;
  employeeCode: string;
  fullName: string;
  fullNameF: string;
  currentSalary: string;
  entitlement: string;
  openingBalance: string;
  earnedLeaves: string;
  overtimeLeaves: string;
  takenLeaves: string;
  encashedLeaves: string;
  loanLeaves: string;
  opEncashments: string;
  deductionFromLeaveBalance: string;
  dept: string;
  position: string;
  branch: string;
  leaveBalance: string;
}
