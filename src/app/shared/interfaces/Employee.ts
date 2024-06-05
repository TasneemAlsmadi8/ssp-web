export interface EmployeeInfo {
  isActive: string;
  id: string;
  code: string;
  directManager: string;
  startDate: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  mobilePhone: string | null;
  homePhone: string | null;
  email: string;
  socialSecurityNo: string | null;
  nationalId: string | null;
  incomeTaxNo: string | null;
  homeStreet: string | null;
  homeBlock: string | null;
  homeBuildingFloorRoom: string | null;
  homeZipCode: string | null;
  loginId: string | null;
  managerName: string;
  position: string;
  terminationDate: string;
}

export interface EmployeeInfoUpdate {
  homeBlock?: string;
  homeZipCode?: string;
  homeStreet?: string;
  homeBuildingFloorRoom?: string;
  mobilePhone?: string;
  homePhone?: string;
}

export interface EmployeeInfoApi {
  isActive: string; //"Y" | "N"; // assuming "Y" for yes and "N" for no
  employeeID: string;
  u_EmpCode: string;
  directManager: string;
  startDate: string; // date string in the format "M/d/yyyy h:mm:ss AM/PM"
  firstName: string;
  middleName: string;
  lastName: string;
  u_FullName: string;
  mobile: string | null;
  homeTel: string | null;
  email: string;
  u_SocialSecurityNo: string | null;
  u_NationalID: string | null;
  u_EmpIncomeTaxNo: string | null;
  homeStreet: string | null;
  homeBlock: string | null;
  homeBuild: string | null;
  homeZip: string | null;
  loginID: string | null;
  managerName: string;
  position: string;
  terminationDate: string; // empty string or date string in the format "M/d/yyyy h:mm:ss AM/PM"
}

//  interface EmployeeResponseApi {
//   isActive: string | null;
//   employeeID: string;
//   u_EmpCode: string | null;
//   directManager: string | null;
//   startDate: string | null;
//   firstName: string | null;
//   middleName: string | null;
//   lastName: string | null;
//   u_FullName: string;
//   mobile: string | null;
//   homeTel: string | null;
//   email: string | null;
//   u_SocialSecurityNo: string | null;
//   u_NationalID: string | null;
//   u_EmpIncomeTaxNo: string | null;
//   homeStreet: string | null;
//   homeBlock: string | null;
//   homeBuild: string | null;
//   homeZip: string | null;
//   loginID: string | null;
//   managerName: string | null;
//   position: string | null;
//   terminationDate: string | null;
// }

export interface EmployeeInfoUpdateApi {
  employeeID: string;
  homeBlock?: string;
  homeZipCode?: string;
  homeStreet?: string;
  homeBuildingFloorRoom?: string;
  mobilePhone?: string;
  homePhone?: string;
}
