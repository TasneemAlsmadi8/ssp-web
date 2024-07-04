export interface SalarySlipReport {
  docEntry: string;
  lineId: string;
  object?: null;
  employeeCode: string;
  employeeId: string;
  fullName: string;
  fullNameForeign?: string;
  department: string;
  departmentName?: string;
  days: number;
  basicSalary: number;
  workUnitNo: number;
  workUnit: string;
  worthSalary: number;
  additionalSalary: number;
  overtime: number;
  repeatableAllowance: number;
  nonRepeatableAllowances: number;
  paidVacation: number;
  totalSalary: number;
  repeatableDeductions: number;
  nonRepeatableDeductions: number;
  incomeTax: number;
  socialSecurity: number;
  netSalary: number;
  workDayOvertimeHoursNo: number;
  workDayOvertimeHoursValue: number;
  weekendOvertimeHoursNo: number;
  weekendOvertimeHoursValue: number;
  holidayOvertimeHoursNo: number;
  holidayOvertimeHoursValue: number;
  position?: string;
  positionName?: string;
  branch?: string;
  branchName?: string;
  tieredAllowance: number;
  paidUnit: number;
  endOfService: number;
  loan: number;
  sponsorship: string;
  payMethod: string;
  employmentDate: string;
  ARNameInReport: string;
  ENNameInReport: string;
  fromDate: string;
  toDate: string;
}

export interface RepeatableAllowance {
  employeeId: string;
  code: string;
  name: string;
  batchNumber: number;
  value: number;
  totalValue: number;
  allowanceId: string;
  allowanceName: string;
  isAdditionalSalary: string; // "Y" or "N" string
}

export interface RepeatableDeduction {
  employeeId: string;
  code: string;
  name: string;
  batchNumber: number;
  value: number;
  companyValue: number;
  deductionId: string;
  deductionName: string;
}

export interface SalarySlipReportInput {
  month: number;
  year: number;
}

export interface SalarySlipReportApi {
  docEntry: string;
  lineId: string;
  object: null;
  u_EmpCode: string;
  empID: string;
  fullName: string;
  u_FullNameF: string;
  department: string;
  departName: string | null;
  u_Days: string;
  u_BasicSalary: string;
  u_WorkUnitNo: string;
  u_WorkUnit: string;
  u_WorthSalary: string;
  u_AdditionalSalary: string;
  u_Overtime: string;
  u_RepAllowance: string;
  u_NonRepAllowances: string;
  u_PaidVacation: string;
  u_TotalSalary: string;
  u_RepDeductions: string;
  u_NonRepDeductions: string;
  u_IncomeTax: string;
  u_SocialSecurity: string;
  u_NetSalary: string;
  u_WorkDayOTHoursNo: string;
  u_WorkDayOTHoursVal: string;
  u_WeekendOTHoursNo: string;
  u_WeekendOTHoursVal: string;
  u_HolidayOTHoursNo: string;
  u_HolidayOTHoursVal: string;
  position: null;
  posName: null;
  branch: null;
  branchName: null;
  u_TieredAllowance: string;
  u_PaidUnit: string;
  u_EOS: string;
  u_Loan: string;
  u_Sponsorship: string;
  u_PayMethod: string;
  u_EmploymentDate: string;
  u_ARNameInReport: string;
  u_ENNameInReport: string;
  u_FromDate: string;
  u_ToDate: string;
}

export interface RepeatableAllowanceApi {
  code: string;
  name: string;
  u_BatchNo: number;
  u_empID: number;
  u_AllowID: string;
  u_Value: number;
  u_TotValue: number;
  u_IsAddSal: string; // "Y" or "N" string
  allowanceName: string;
}

export interface RepeatableDeductionApi {
  code: string;
  name: string;
  u_BatchNo: number;
  u_empID: number;
  u_DeductID: string;
  u_Value: number;
  u_CompValue: number;
  deductionName: string;
}
