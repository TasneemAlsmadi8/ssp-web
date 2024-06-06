import { Item } from '../generic-item';

export interface LoanHistory extends Item {
  id: string;
  dateSubmitted: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  fullNameF: string;
  loanCode: string;
  loanName: string;
  totalAmount: number;
  installmentCount: number;
  startDate: string;
  remarks?: string;
}

export interface LoanHistoryApi {
  loanID: string;
  dateSubmitted: string; // datetime string in the format "yyyy-MM-ddTHH:mm:ss"
  empID: string;
  loanCode: string;
  empCode: string;
  fullName: string;
  fullNameF?: string | null;
  loanName: string;
  totalAmount: string; // decimal string
  installmentCount: string; // numeric string
  startDate: string; // datetime string in the format "yyyy-MM-ddTHH:mm:ss"
  statusID?: number | null;
  status?: string;
  remarks?: string | null;
}
