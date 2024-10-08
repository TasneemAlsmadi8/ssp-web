import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { EmployeeInfo } from '../interfaces/Employee';

@Injectable({
  providedIn: 'root',
})
export class LocalUserService {
  // constructor(private languageService: LanguageService) {}

  setUser(user: User): void {
    localStorage.setItem('isUserLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(user));
  }

  setUserFromEmployee(employee: EmployeeInfo): void {
    const user: User = {
      id: employee.id,
      code: employee.code,
      fullName: employee.fullName,
      position: employee.position,
    };

    this.setUser(user);
  }

  getUser(): User {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    if (!user?.id || !user?.code || !user?.fullName) {
      throw new Error('User not signed in!');
    }
    return user as User;
  }

  removeUser(): void {
    localStorage.removeItem('isUserLoggedIn');
    localStorage.removeItem('user');
  }

  checkLogin(): boolean {
    return localStorage.getItem('isUserLoggedIn') === 'true';
  }
}
