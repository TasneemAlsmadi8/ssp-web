import { GenericApproval } from "./shared";

export interface OvertimeApproval extends GenericApproval{
  dateSubmitted: string;
  fromDate: string;
  id: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  fullNameF: string;
  overtimeCode: string;
  overtimeType: string;
  hour: number;
  minute: number;
  remarks: string;
  projectCode: string;
  projectName: string;
}

export interface OvertimeApprovalApi {
  action: string | null;
  dateSubmitted: string;
  fromDate: string;
  overtimeID: string;
  empID: string;
  empCode: string;
  fullName: string;
  fullNameF: string;
  overtimeCode: string;
  overtimeType: string;
  ovHour: string;
  ovMin: string;
  statusID: string | null;
  status: string;
  remarks: string;
  projectCode: string;
  projectName: string;
}
