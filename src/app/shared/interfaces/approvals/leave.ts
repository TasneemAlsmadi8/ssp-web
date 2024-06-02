export interface LeaveApproval {
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
