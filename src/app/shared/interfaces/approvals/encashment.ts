import { GenericApproval } from './shared';

export interface EncashmentApproval extends GenericApproval {
  dateSubmitted: string;
  date: string;
  id: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  fullNameF: string;
  encashCode: string;
  encashName: string;
  unitCount: string;
  value: string;
  status: string;
  remarks: string;
  projectCode: string;
  projectName: string;
}

export interface EncashmentApprovalApi {
  action: string | null;
  dateSubmitted: string;
  date: string;
  encashID: string;
  empID: string;
  empCode: string;
  fullName: string;
  fullNameF: string;
  encashCode: string;
  encashName: string;
  unitCount: string;
  value: string;
  statusID: string | null;
  status: string;
  remarks: string;
  projectCode: string;
  projectName: string;
}
