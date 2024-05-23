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
import { formatDateToISO } from 'src/app/shared/utils/data-formatter';

@Component({
  selector: 'app-value-transaction-request-details',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './value-transaction-request-details.component.html',
  styleUrls: ['./value-transaction-request-details.component.scss'],
})
export class ValueTransactionRequestDetailsComponent
  extends DestroyBaseComponent
  implements OnInit, OnChanges
{
  @Input() isEditable: boolean = true;
  @Input({ required: true }) valueTransactionRequest!: ValueTransactionRequest;
  @Output() valueTransactionRequestChange =
    new EventEmitter<ValueTransactionRequest>();
  faEdit = faPenToSquare;
  faView = faEye;

  isLoading = false;
  user: User;
  valueTransactionTypes: ValueTransactionRequestType[] = [];
  projects: Project[] = [];
  form: FormGroup;

  constructor(
    private userService: LocalUserService,
    private valueTransactionRequestService: ValueTransactionRequestService,
    private projectsService: ProjectsService,
    private fb: FormBuilder
  ) {
    super();
    this.user = this.userService.getUser();
    this.form = this.fb.group({
      valueTransactionType: [''],
      value: [''],
      date: [''],
      project: [''],
      remarks: [''],
    });
    this.setFormState();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditable']) {
      this.setFormState();
    }
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

  private setFormState() {
    if (this.isEditable) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  private setInputsDefaultValues() {
    this.form
      .get('valueTransactionType')
      ?.setValue(this.valueTransactionRequest.valueTranCode);
    this.form
      .get('date')
      ?.setValue(formatDateToISO(this.valueTransactionRequest.date));
    this.form.get('value')?.setValue(this.valueTransactionRequest.value);
    this.form
      .get('project')
      ?.setValue(this.valueTransactionRequest.projectCode);
    this.form.get('remarks')?.setValue(this.valueTransactionRequest.remarks);
  }

  onSubmit() {
    this.isLoading = true;
    const formValues = this.form.value;
    const data: ValueTransactionRequestUpdateSchema = {
      docEntry: this.valueTransactionRequest.valueTranID,
      u_ValueTranType: formValues.valueTransactionType ?? undefined,
      u_TranValue: formValues.value?.toString() ?? undefined,
      u_Date: formValues.date ?? undefined,
      u_ProjectCode: formValues.project ?? undefined,
      u_Remarks: formValues.remarks ?? undefined,
    };
    this.valueTransactionRequestService
      .update(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // this.updateValueTransactionRequestModel();
          Swal.fire({
            title: 'Saved!',
            text: 'Information updated successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
          });
          console.log(res);
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
  /** change format from "dd/mm/yyyy" to standard "yyyy-mm-dd" */
  private formatDate(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
}
