import { GenericApproval } from "./shared";

export interface LeaveApproval extends GenericApproval{
  id: string;
  dateSubmitted: string;
  fromDate: string;
  toDate: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  fullNameF: string;
  leaveCode: string;
  leaveType: string;
  fromTime: string | null;
  toTime: string | null;
  leaveBalance: number;
  status: string;
  remarks: string;
}

export interface LeaveApprovalApi {
  action: string | null;
  dateSubmitted: string;
  fromDate: string;
  toDate: string;
  leaveID: string;
  empID: string;
  empCode: string;
  fullName: string;
  fullNameF: string;
  leaveCode: string;
  leaveType: string;
  fromTime: string | null;
  toTime: string | null;
  leaveBalance: string;
  statusID: string | null;
  status: string;
  remarks: string;
}
