import { Item } from '../generic-item';

export interface LeaveHistory extends Item {
  id: string;
  dateSubmitted: string;
  employeeId: string;
  leaveType: string;
  leaveCode: string;
  employeeCode: string;
  fullName: string;
  fullNameF: string;
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
  remarks?: string;
}

export interface LeaveHistoryApi {
  leaveID: string;
  dateSubmitted: string; // datetime string in the format "yyyy-MM-ddTHH:mm:ss"
  empID: string;
  leaveCode: string;
  empCode: string;
  fullName: string;
  fullNameF: string;
  leaveType: string;
  fromDate: string; // datetime string in the format "yyyy-MM-ddTHH:mm:ss"
  toDate: string; // datetime string in the format "yyyy-MM-ddTHH:mm:ss"
  fromTime: string; // time string in the format "HHmm"
  toTime: string; // time string in the format "HHmm"
  statusID?: number | null;
  status?: string;
  remarks?: string;
}
