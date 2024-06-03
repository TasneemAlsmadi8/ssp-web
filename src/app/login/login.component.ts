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
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { UserLogin } from '../shared/interfaces/user';
import { AuthService } from '../shared/services/auth.service';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from '../shared/base/destroy-base.component';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { InputComponent } from '../shared/components/input/input.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../shared/services/language.service';
import { UserConfirmationService } from '../shared/services/user-confirmation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    InputComponent,
    TranslateModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends DestroyBaseComponent implements OnInit {
  faCoffee = faKey;
  isLoading = false;
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    public languageService: LanguageService,
    private userConfirmationService: UserConfirmationService
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
            this.userConfirmationService.showError(
              'Error!',
              'Invalid username or password',
              'Retry'
            );
          } else {
            this.userConfirmationService.showError(
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
