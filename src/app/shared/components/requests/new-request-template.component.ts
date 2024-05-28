import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
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
} from 'src/app/shared/interfaces/requests/generic-request';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { takeUntil } from 'rxjs';

@Component({
  standalone: true,
  template: '',
})
export abstract class NewRequestComponentTemplate<
    T extends Item,
    A extends AddSchema
  >
  extends DestroyBaseComponent
  implements OnInit
{
  isLoading: boolean = false;
  user: User;
  form: FormGroup;

  @Output() onSave = new EventEmitter<T>();

  abstract item: T;
  abstract mapFormToAddRequest(formValues: any): A;
  updateCalculatedValues?(): void;
  getDynamicValues?(): void;

  private fb: FormBuilder;
  private userService: LocalUserService;

  // @Inject(null) -> to disable DI to provide values in child class
  constructor(
    @Inject(null) private requestService: GenericRequestService<T, any, A, any>,
    @Inject(null) public formControls: { [key: string]: any[] }
  ) {
    super();
    this.userService = inject(LocalUserService);
    this.fb = inject(FormBuilder);
    this.user = this.userService.getUser();
    this.form = this.fb.group(this.formControls);

    this.form.valueChanges.subscribe(() => {
      if (this.updateCalculatedValues) this.updateCalculatedValues();
    });
  }

  ngOnInit(): void {
    this.setInputsDefaultValues();
    if (this.getDynamicValues) this.getDynamicValues();
  }

  setInputsDefaultValues(): void {
    for (const key in this.formControls) {
      const defaultValue = this.formControls[key]?.[0];
      this.form.get(key)?.setValue(defaultValue);
    }
  }

  onSubmit() {
    this.isLoading = true;
    const data = this.mapFormToAddRequest(this.form.value);
    this.requestService
      .add(data)
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

          this.setInputsDefaultValues();
          this.onSave.emit(this.item);
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
}
