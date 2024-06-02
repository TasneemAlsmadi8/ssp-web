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
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { User } from '../../interfaces/user';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LocalUserService } from 'src/app/shared/services/local-user.service';
import { GenericRequestService } from 'src/app/shared/services/requests/generic-request.service';
import {
  AddSchema,
  Item,
  UpdateSchema,
} from 'src/app/shared/interfaces/requests/generic-request';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormErrorMessageBehavior } from '../FormErrorMessage';

export type FormValues<T> = {
  [key in keyof T]: string | number | null;
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

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<T>();
  @Output() onSubmitSuccess = new EventEmitter<T>();
  @Output() onSubmitFail = new EventEmitter<T>();

  private _isOpen = false;
  get isOpen() {
    return this._isOpen;
  }

  isLoading: boolean = false;
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
  ): string;

  private fb: FormBuilder;
  private userService: LocalUserService;
  // private formValues: FormValues = {};

  // @Inject(null) -> to disable DI to provide values in child class
  constructor(
    @Inject(null) private requestService: GenericRequestService<T, U, any, any>,
    @Inject(null) public formControls: { [key: string]: any[] }
  ) {
    super();
    this.userService = inject(LocalUserService);
    this.fb = inject(FormBuilder);
    this.user = this.userService.getUser();
    this.form = this.fb.group(this.formControls);

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

    if (onlyDirty) return control.invalid && control.dirty;
    return control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(formControlName: string, inputTitle = 'Value'): string {
    const control = this.form.get(formControlName);
    if (!control) throw new Error('Invalid form Control');

    if (control.hasError('required')) {
      return `${inputTitle} is required`;
    }
    if (control.hasError('min')) {
      return `${inputTitle} must be at least ${control.getError('min')?.min}`;
    }
    if (control.hasError('max')) {
      return `${inputTitle} must be at most ${control.getError('max')?.max}`;
    }

    if (this.additionalErrorMessages) {
      const customMessage = this.additionalErrorMessages(control, inputTitle);
      if (customMessage) return customMessage;
    }

    return '';
  }

  onSubmit() {
    this.isLoading = true;
    this.onSave.emit(this.item);
    const data = this.mapFormToUpdateRequest(this.form.value);
    this.requestService
      .update(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // this.updateEncashmentRequestModel();
          Swal.fire({
            title: 'Saved!',
            text: 'Information updated successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
          });
          this.onSubmitSuccess.emit(this.item);
        },
        error: (err: HttpErrorResponse) => {
          Swal.fire({
            title: 'Error!',
            // text: 'Unknown error: ' + err.status,
            icon: 'error',
            confirmButtonText: 'Ok',
          });
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
