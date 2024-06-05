import { GenericApproval } from './shared';

export interface ValueTransactionApproval extends GenericApproval {
  dateSubmitted: string;
  date: string;
  id: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  fullNameF: string;
  valueTranCode: string;
  valueTranName: string;
  value: number;
  status: string;
  remarks: string;
  projectCode: string;
  projectName: string;
}

export interface ValueTransactionApprovalApi {
  action: string | null;
  dateSubmitted: string;
  date: string;
  valueTranID: string;
  empID: string;
  empCode: string;
  fullName: string;
  fullNameF: string;
  valueTranCode: string;
  valueTranName: string;
  value: string;
  statusID: string | null;
  status: string;
  remarks: string;
  projectCode: string;
  projectName: string;
}
