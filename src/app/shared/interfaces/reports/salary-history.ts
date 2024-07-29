import { DataRecord } from '../../utils/pdf-utils/parser/element-json-types';

export interface SalaryHistoryReport extends DataRecord {
  u_empID: string;
  u_EmpCode: string;
  u_FullName: string;
  startDate: string; // Date (YYYY-MM-DDTHH:MM:SS)
  value: string; // Value as decimal string
  code: string;
  name: string;
  type: string;
  order: string;
  fromDate: string; // Date (YYYY-MM-DDTHH:MM:SS)
  toDate: null | string; // Date (YYYY-MM-DDTHH:MM:SS)
  u_Remarks: string;
  currentSalary: string; // Value as decimal string
  active: string;
  year: string;
  dept: null | string;
  dept_Name: null | string;
  dept_Remarks: null | string;
}
