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
import { faCoffee, faKey } from '@fortawesome/free-solid-svg-icons';
import { faKeybase, faKeycdn } from '@fortawesome/free-brands-svg-icons';
import { User, UserLogin } from '../shared/interfaces/user';
import { AuthService } from '../shared/services/auth.service';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from '../shared/base/destroy-base.component';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FontAwesomeModule],
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

  constructor(private authService: AuthService, private router: Router) {
    super();
  }
  ngOnInit(): void {
    let isLoggedIn = false;
    this.authService.checkLogin().subscribe((val) => (isLoggedIn = val));
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
            Swal.fire({
              title: 'Error!',
              text: 'Invalid username or password',
              icon: 'error',
              confirmButtonText: 'Retry',
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Unknown error: ' + err.status,
              icon: 'error',
              confirmButtonText: 'Retry',
            });
            console.log(err);
          }
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
