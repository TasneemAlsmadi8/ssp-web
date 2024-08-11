import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserLogin } from '../shared/interfaces/user';
import { AuthService } from '../shared/services/auth.service';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from '../shared/base/destroy-base.component';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../shared/services/language.service';
import { UserAlertService } from '../shared/services/user-alert.service';
import { PasswordInputComponent } from '../shared/components/password-input/password-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    TranslateModule,
    PasswordInputComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends DestroyBaseComponent implements OnInit {
  isLoading = false;
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    public languageService: LanguageService,
    private userAlertService: UserAlertService
  ) {
    super();
  }
  ngOnInit(): void {
    let isLoggedIn = false;
    this.authService
      .checkLogin()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => (isLoggedIn = val));
    if (isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    this.isLoading = true;
    const user: UserLogin = this.loginForm.value as UserLogin;
    this.authService
      .login(user)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log('success', res);
          this.router.navigate(['/']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == HttpStatusCode.BadRequest) {
            this.userAlertService.showError(
              'Error!',
              'Invalid username or password',
              'Retry'
            );
          } else {
            this.userAlertService.showError(
              'Error!',
              'Unknown error: ' + err.status,
              'Retry'
            );
            console.log(err);
          }
          this.loginForm.reset(this.loginForm.value);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  get usernameFormControl(): FormControl {
    return this.loginForm.get('username') as FormControl;
  }
  get passwordFormControl(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }
}
