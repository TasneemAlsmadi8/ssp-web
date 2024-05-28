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
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { takeUntil } from 'rxjs';

export type FormValues = {
  [key: string]: string | number | null;
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
  implements OnInit, OnChanges
{
  @Input() isEditable: boolean = true;
  @Input({ required: true }) item!: T;
  @Input() set isOpen(value) {
    this._isOpen = value;
    this.isOpenChange.emit(value);
  }

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<T>();

  private _isOpen = false;
  get isOpen() {
    return this._isOpen;
  }

  isLoading: boolean = false;
  user: User;
  form: FormGroup;

  abstract mapFormToUpdateRequest(formValues: any): U;
  abstract mapItemFieldsToFormValues(item: T): FormValues;
  updateCalculatedValues?(): void;
  getDynamicValues?(): void;

  private fb: FormBuilder;
  private userService: LocalUserService;
  private formValues: FormValues = {};

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
      const newValues = this.form.value;
      // check if any value changed
      for (const key in newValues) {
        if (this.formValues[key] !== newValues[key]) {
          this.formValues = { ...newValues };
          if (this.updateCalculatedValues) this.updateCalculatedValues();
        }
      }
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

    // for (const key in this.formControls) {
    this.form.setValue(defaultValues);
    // }
  }

  onSubmit() {
    this.isLoading = true;
    const data = this.mapFormToUpdateRequest(this.formValues);
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
        },
        error: (err: HttpErrorResponse) => {
          Swal.fire({
            title: 'Error!',
            // text: 'Unknown error: ' + err.status,
            icon: 'error',
            confirmButtonText: 'Ok',
          });
          console.log(err);
        },
      })
      .add(() => {
        this.isLoading = false;
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
