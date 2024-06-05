export interface OvertimeApproval {
  dateSubmitted: string;
  fromDate: string;
  id: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  fullNameF: string;
  overtimeCode: string;
  overtimeType: string;
  hour: string;
  minute: string;
  status: string;
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
