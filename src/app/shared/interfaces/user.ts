export interface User {
  id: string;
  code: string;
  fullName: string;
  position: string;
  // preferedLanguage: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

//example user
// {
//     "isActive": "Y",
//     "employeeID": "1066",
//     "u_EmpCode": "408",
//     "directManager": "1020",
//     "startDate": "1/1/2023 12:00:00 AM",
//     "firstName": "Eisberg",
//     "middleName": "Test",
//     "lastName": "24 hours",
//     "u_FullName": "Eisberg Test 24 hours",
//     "mobile": null,
//     "homeTel": null,
//     "email": "408",
//     "u_SocialSecurityNo": null,
//     "u_NationalID": null,
//     "u_EmpIncomeTaxNo": null,
//     "homeStreet": null,
//     "homeBlock": null,
//     "homeBuild": null,
//     "homeZip": null,
//     "loginID": null,
//     "managerName": "يزيد طايل خالد الزعبي",
//     "position": "رئيس قسم",
//     "terminationDate": ""
//   }
