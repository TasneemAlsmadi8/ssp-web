import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ValueTransactionRequest,
  ValueTransactionRequestAddSchema,
  ValueTransactionRequestStatus,
  ValueTransactionRequestType,
  ValueTransactionRequestUpdateSchema,
} from 'src/app/shared/interfaces/requests/value-transaction';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { faEye, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LocalUserService } from 'src/app/shared/services/local-user.service';
import { User } from 'src/app/shared/interfaces/user';
import { ValueTransactionRequestService } from 'src/app/shared/services/requests/value-transaction.service';
import { takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Project } from 'src/app/shared/interfaces/project';
import { ProjectsService } from 'src/app/shared/services/projects.service';
import { NewRequestModalComponent } from 'src/app/shared/components/requests/new-request-modal/new-request-modal.component';
import { NewRequestComponentTemplate } from 'src/app/shared/components/requests/generic-new-request.component';

@Component({
  selector: 'app-new-value-transaction-request',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    NewRequestModalComponent,
  ],
  templateUrl: './new-value-transaction-request.component.html',
  styleUrls: ['./new-value-transaction-request.component.scss'],
})
export class NewValueTransactionRequestComponent
  extends NewRequestComponentTemplate<
    ValueTransactionRequest,
    ValueTransactionRequestAddSchema
  >
  implements OnInit
{
  @Output() onSave = new EventEmitter<ValueTransactionRequest>();
  faEdit = faPenToSquare;
  faView = faEye;

  item: ValueTransactionRequest = {
    valueTranID: '',
    u_EmployeeID: '',
    valueTranName: '',
    value: '',
    date: '',
    status: '',
    remarks: '',
    valueTranCode: '',
    u_Status: null,
    createDate: '',
    u_ApprStatus1: null,
    u_ApprStatus2: null,
    u_ApprStatus3: null,
    projectCode: '',
    sortDate: '',
  };

  valueTransactionTypes: ValueTransactionRequestType[] = [];
  projects: Project[] = [];

  constructor(
    private valueTransactionRequestService: ValueTransactionRequestService,
    private projectsService: ProjectsService
  ) {
    const today = new Date().toISOString().slice(0, 10);
    super(valueTransactionRequestService, {
      valueTransactionType: [''],
      value: [0],
      date: [today],
      project: [''],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.setInputsDefaultValues();
    this.valueTransactionRequestService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.valueTransactionTypes = value;
      });
    this.projectsService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.projects = value;
      });
  }

  override mapFormToAddRequest(
    formValues: any
  ): ValueTransactionRequestAddSchema {
    const data: ValueTransactionRequestAddSchema = {
      u_EmployeeID: '',
      u_ValueTranType: formValues.valueTransactionType ?? undefined,
      u_TranValue: formValues.value?.toString() ?? undefined,
      u_Date: formValues.date ?? undefined,
      u_ProjectCode: formValues.project ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
    };
    return data;
  }

  // private setInputsDefaultValues() {
  //   const today = new Date().toISOString().slice(0, 10);
  //   this.form.get('valueTransactionType')?.setValue('');
  //   this.form.get('date')?.setValue(today);
  //   this.form.get('value')?.setValue(0);
  //   this.form.get('project')?.setValue('');
  //   this.form.get('remarks')?.setValue('');
  // }

  // onSubmit() {
  //   this.isLoading = true;
  //   const formValues = this.form.value;
  //   const data: ValueTransactionRequestAddSchema = {
  //     u_EmployeeID: '',
  //     u_ValueTranType: formValues.valueTransactionType ?? undefined,
  //     u_TranValue: formValues.value?.toString() ?? undefined,
  //     u_Date: formValues.date ?? undefined,
  //     u_ProjectCode: formValues.project ?? undefined,
  //     u_Remarks: formValues.remarks ?? undefined,
  //   };
  //   this.valueTransactionRequestService
  //     .add(data)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (res) => {
  //         // this.updateValueTransactionRequestModel();
  //         Swal.fire({
  //           title: 'Saved!',
  //           text: 'Information updated successfully',
  //           icon: 'success',
  //           confirmButtonText: 'Ok',
  //         });
  //       },
  //       error: (err: HttpErrorResponse) => {
  //         Swal.fire({
  //           title: 'Error!',
  //           // text: 'Unknown error: ' + err.status,
  //           icon: 'error',
  //           confirmButtonText: 'Ok',
  //         });
  //         console.log(err);
  //       },
  //     })
  //     .add(() => {
  //       this.isLoading = false;
  //     });
  // }
}
