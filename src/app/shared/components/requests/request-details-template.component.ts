import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
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
import {
  AddSchema,
  Item,
  UpdateSchema,
} from 'src/app/shared/interfaces/generic-item';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormErrorMessageBehavior } from '../FormErrorMessage';
import { TranslateService } from '@ngx-translate/core';
import { UserAlertService } from '../../services/user-alert.service';

export type FormValues<T> = {
  [key in keyof T]?: string | number | null;
};

@Component({
  standalone: true,
  template: '',
})
export abstract class RequestDetailsComponentTemplate<
    T extends Item,
    U extends UpdateSchema
  >
  extends DestroyBaseComponent
  implements OnInit, OnChanges, FormErrorMessageBehavior
{
  @Input() isEditable: boolean = true;
  @Input({ required: true }) item!: T;
  @Input() set isOpen(value) {
    this._isOpen = value;
    this.isOpenChange.emit(value);
  }
  @Input() isCurrentEmployee = true;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<T>();
  @Output() onSubmitSuccess = new EventEmitter<T>();
  @Output() onSubmitFail = new EventEmitter<T>();

  private _isOpen = false;
  get isOpen() {
    return this._isOpen;
  }

  isLoading: boolean = false;
  showAllErrors = false;
  user: User;
  form: FormGroup;

  abstract mapFormToUpdateRequest(formValues: any): U;
  abstract mapItemFieldsToFormValues(
    item: T
  ): FormValues<typeof this.formControls>;
  updateCalculatedValues?(): void;
  getDynamicValues?(): void;
  resetInvalidInputs?(): void;
  additionalErrorMessages?(
    control: AbstractControl,
    inputTitle: string
  ): string | null;

  private fb: FormBuilder;
  private userService: LocalUserService;
  protected translate: TranslateService;
  private userAlertService: UserAlertService;

  // @Inject(null) -> to disable DI to provide values in child class
  constructor(
    @Inject(null) private requestService: GenericRequestService<T, U, any, any>,
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditable']) {
      this.setFormState();
    }
    if (changes['item']) {
      this.setInputsDefaultValues();
      // console.log(this.item);
    }
    if (
      !this.isCurrentEmployee &&
      this.getDynamicValues &&
      changes['employeeId']
    ) {
      this.getDynamicValues();
    }
  }

  ngOnInit(): void {
    // this.setFormState();
    // this.setInputsDefaultValues();
    // if (this.updateCalculatedValues) this.updateCalculatedValues();
    if (this.getDynamicValues) this.getDynamicValues();
  }

  setInputsDefaultValues(): void {
    const defaultValues = this.mapItemFieldsToFormValues(this.item);
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
    inputTitle: string = 'Value'
  ): string {
    const control = this.form.get(formControlName);
    if (!control) throw new Error('Invalid form control');

    // Translate inputTitle
    inputTitle = this.translate.instant(inputTitle);

    if (control.hasError('required')) {
      return `${inputTitle} ${this.translate.instant('is required')}`;
    }
    if (control.hasError('min')) {
      return `${inputTitle} ${this.translate.instant('must be at least')} ${
        control.getError('min')?.min
      }`;
    }
    if (control.hasError('max')) {
      return `${inputTitle} ${this.translate.instant('must be at most')} ${
        control.getError('max')?.max
      }`;
    }

    if (this.additionalErrorMessages) {
      const customMessage = this.additionalErrorMessages(control, inputTitle);
      if (customMessage) return this.translate.instant(customMessage);
    }

    return '';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.showAllErrors = true;
      return;
    }
    this.isLoading = true;
    this.onSave.emit(this.item);
    const data = this.mapFormToUpdateRequest(this.form.value);
    this.requestService
      .update(data, this.item.employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // this.updateEncashmentRequestModel();
          this.userAlertService.showSuccess(
            'Saved!',
            'Information updated successfully'
          );
          this.onSubmitSuccess.emit(this.item);
        },
        error: (err: HttpErrorResponse) => {
          this.userAlertService.showError('Error!', err.error);
          console.log(err);
          this.onSubmitFail.emit(this.item);
        },
      })
      .add(() => {
        this.isLoading = false;
        this.form.reset(this.form.value);
      });
  }

  private setFormState() {
    if (this.isEditable) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }
}
