import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { User } from '../../interfaces/user';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LocalUserService } from 'src/app/shared/services/local-user.service';
import { GenericRequestService } from 'src/app/shared/services/requests/generic-request.service';
import { AddSchema, Item } from 'src/app/shared/interfaces/generic-item';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { FormErrorMessageBehavior } from '../FormErrorMessage';
import { TranslateService } from '@ngx-translate/core';
import { UserAlertService } from '../../services/user-alert.service';

@Component({
  standalone: true,
  template: '',
})
export abstract class NewRequestComponentTemplate<
    T extends Item,
    A extends AddSchema
  >
  extends DestroyBaseComponent
  implements OnInit, FormErrorMessageBehavior
{
  isLoading: boolean = false;
  user: User;
  form: FormGroup;

  @Output() onSave = new EventEmitter<T>();

  abstract item: T;
  abstract mapFormToAddRequest(formValues: any): A;
  updateCalculatedValues?(): void;
  getDynamicValues?(): void;
  resetInvalidInputs?(): void;
  additionalErrorMessages?(
    control: AbstractControl,
    inputTitle: string,
    customMessage?: string
  ): string | null;

  private fb: FormBuilder;
  private userService: LocalUserService;
  protected translate: TranslateService;
  private userAlertService: UserAlertService;
  showAllErrors = false;

  // @Inject(null) -> to disable DI to provide values in child class
  constructor(
    @Inject(null) private requestService: GenericRequestService<T, any, A, any>,
    @Inject(null) public formControls: { [key: string]: any[] },
    @Inject(null) formControlOptions: AbstractControlOptions = {}
  ) {
    super();
    this.userService = inject(LocalUserService);
    this.translate = inject(TranslateService);
    this.userAlertService = inject(UserAlertService);
    this.fb = inject(FormBuilder);
    this.user = this.userService.getUser();
    this.form = this.fb.group(this.formControls, formControlOptions);

    this.form.valueChanges.subscribe(() => {
      if (this.resetInvalidInputs) this.resetInvalidInputs();
    });
    this.form.valueChanges
      .pipe(
        debounceTime(300), // debounce time to prevent duplicate requests
        distinctUntilChanged((prev, curr) => {
          for (const key in prev) {
            if (
              !Object.prototype.hasOwnProperty.call(prev, key) ||
              curr[key] !== prev[key]
            ) {
              return false;
            }
          }
          return true;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.updateCalculatedValues) this.updateCalculatedValues();
      });
  }

  ngOnInit(): void {
    this.setInputsDefaultValues();
    if (this.getDynamicValues) this.getDynamicValues();
  }

  setInputsDefaultValues(): void {
    const defaultValues = {};
    for (const key in this.formControls) {
      (defaultValues as any)[key] = this.formControls[key]?.[0];
    }
    this.form.reset(defaultValues, { emitEvent: false });
  }

  shouldDisplayError(formControlName: string, onlyDirty = false): boolean {
    const control = this.form.get(formControlName);
    if (!control) throw new Error('Invalid form Control');

    if (this.showAllErrors) return control.invalid;
    if (onlyDirty) return control.invalid && control.dirty;
    return control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(
    formControlName: string,
    inputTitle: string = 'Value',
    customMessage: string = ''
  ): string {
    const control = this.form.get(formControlName);
    if (!control) throw new Error('Invalid form control');

    // Translate inputTitle
    inputTitle = this.translate.instant(inputTitle);

    if (control.hasError('required')) {
      return `${inputTitle} ${this.translate.instant(
        'is required'
      )}. ${customMessage}`;
    }
    if (control.hasError('min')) {
      return `${inputTitle} ${this.translate.instant('must be at least')} ${
        control.getError('min')?.min
      }. ${customMessage}`;
    }
    if (control.hasError('max')) {
      return `${inputTitle} ${this.translate.instant('must be at most')} ${
        control.getError('max')?.max
      }. ${customMessage}`;
    }

    if (this.additionalErrorMessages) {
      const additionalMessage = this.additionalErrorMessages(
        control,
        inputTitle
      );
      if (additionalMessage)
        return this.translate.instant(additionalMessage) + ' ' + customMessage;
    }

    return '';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.showAllErrors = true;
      return;
    }
    this.isLoading = true;
    const data = this.mapFormToAddRequest(this.form.value);
    this.requestService
      .add(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // this.updateEncashmentRequestModel();
          this.userAlertService.showSuccess(
            'Saved!',
            'Information updated successfully'
          );

          this.setInputsDefaultValues();
          this.onSave.emit(this.item);
        },
        error: (err: HttpErrorResponse) => {
          this.userAlertService.showError('Error!', err.error);
          console.log(err);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
