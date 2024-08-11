import { Component, Input, forwardRef } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="formGroup">
      <input
        [type]="isPasswordHidden ? 'password' : 'text'"
        [placeholder]="placeholder"
        [ngClass]="applyClasses()"
        [value]="value"
        (input)="onInputChange($event)"
        [disabled]="isDisabled"
        [className]="customClasses"
      />
      <button
        (click)="toggleShowPassword()"
        type="button"
        [disabled]="isDisabled"
        class="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 rtl:left-3 ltr:right-3 -translate-y-2/4"
      >
        <fa-icon *ngIf="isPasswordHidden" [icon]="faEye"></fa-icon>
        <fa-icon *ngIf="!isPasswordHidden" [icon]="faEyeSlash"></fa-icon>
      </button>
    </div>
  `,
  styleUrls: ['./password-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() formGroup!: FormGroup;
  @Input() formControlName!: string;
  @Input() customClasses: string = '';
  @Input() customNgClass: { [key: string]: boolean } = {}; // Add customNgClass input
  @Input() placeholder: string = 'Enter your password';

  faEye = faEye;
  faEyeSlash = faEyeSlash;
  isPasswordHidden = true;
  isDisabled = false;
  value: string = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  toggleShowPassword() {
    if (!this.isDisabled) {
      this.isPasswordHidden = !this.isPasswordHidden;
    }
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.value = inputElement.value;
    this.onChange(this.value);
    this.onTouched();
  }

  // Method to combine custom classes and disabled state classes
  applyClasses(): { [key: string]: boolean } {
    return {
      ...this.customNgClass,
      // 'disabled-input': this.isDisabled,
      // [this.customClasses]: true,
    };
  }
}
