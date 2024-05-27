import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../modal/modal.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from '../../../interfaces/user';
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
  selector: 'app-new-request-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './new-request-modal.component.html',
  styleUrls: ['./new-request-modal.component.scss'],
})
export class NewRequestModalComponent {
  @Input({ required: true }) title!: string;
}

// @Component({
//   selector: '',
//   standalone: true,
//   imports: [CommonModule, ModalComponent],
//   template: '',
// })
export abstract class GenericNewRequestComponent<
  T extends Item,
  A extends AddSchema
> extends DestroyBaseComponent {
  isLoading: boolean = false;
  user: User;
  form: FormGroup;

  abstract onSave: EventEmitter<T>;
  abstract item: T;
  // formControls: { [key: string]: any[] };
  // defaultValues: { [key: string]: any };
  abstract mapFormToAddRequest(formValues: any): A;
  abstract updateDynamicValues?(): void;

  private fb: FormBuilder;
  private userService: LocalUserService;

  constructor(
    private requestService: GenericRequestService<T, any, A, any>,
    public formControls: { [key: string]: any[] }
  ) {
    super();
    this.userService = inject(LocalUserService);
    this.fb = inject(FormBuilder);
    this.user = this.userService.getUser();
    this.form = this.fb.group(this.formControls);
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
        this.setInputsDefaultValues();
      });
  }
}
