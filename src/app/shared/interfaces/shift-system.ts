export interface EmployeeShift {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  shiftType: string;
}

export interface EmployeeShiftApi {
  sn?: null;
  docEntry: string;
  u_EmpID: string;
  u_EmpCode: string;
  u_EmpName: string;
  u_Date: string; // datetime string in the format "yyyy-MM-ddTHH:mm:ss"
  u_Shift: string;
  lineId: string;
  visOrder: string;
}
