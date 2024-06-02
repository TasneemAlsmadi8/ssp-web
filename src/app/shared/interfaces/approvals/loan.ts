export interface LoanApproval {
  action: string | null;
  dateSubmitted: string;
  startDate: string;
  loanID: string;
  empID: string;
  empCode: string;
  fullName: string;
  fullNameF: string;
  loanCode: string;
  loanName: string;
  totalAmount: string;
  installmentCount: string;
  statusID: string | null;
  status: string;
  remarks: string;
}
