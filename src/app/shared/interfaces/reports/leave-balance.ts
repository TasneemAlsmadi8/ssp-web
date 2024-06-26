export interface LeaveBalanceReport {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  fullNameForeign?: string | null;
  currentSalary: number; // decimal string
  entitlement: number; // decimal string
  openingBalance: number; // decimal string
  earnedLeaves: number; // decimal string
  overtimeLeaves: number; // decimal string
  takenLeaves: number; // decimal string
  encashedDays: number; // decimal string
  deductionFromLeaveBalance: number; // decimal string
  opEncashments: number; // decimal string
  leaveBalance: number; // decimal string
  leaveName: string;
  monthDays: number; // decimal string
  monthDaysCalendar: string;
  paidOnEOS: string;
  dept: string;
  position: string;
  branch: string;
  leaveCode: string;
  basicSalary: number; // decimal string
  paidVacationValue: number; // decimal string
}

export interface LeaveBalanceReportInput {
  leaveCode: string;
  toDate: string; // yyyy-mm-dd
}

export interface LeaveBalanceReportApi {
  empID: string;
  employeeCode: string;
  fullName: string;
  u_FullNameF?: string | null;
  currentSalary: string; // decimal string
  entitlement: string; // decimal string
  openingBalance: string; // decimal string
  earnedLeaves: string; // decimal string
  overtimeLeaves: string; // decimal string
  takenLeaves: string; // decimal string
  encashedDays: string; // decimal string
  deductionFromLeaveBalance: string; // decimal string
  opEncashments: string; // decimal string
  leaveBalance: string; // decimal string
  leaveName: string;
  u_MonthDays: string; // decimal string
  u_MonthDaysCalendar: string;
  u_PaidOnEOS: string;
  dept: string;
  position: string;
  branch: string;
  leaveCode: string;
  basicSalary: string; // decimal string
  paidVacationValue: string; // decimal string
}
