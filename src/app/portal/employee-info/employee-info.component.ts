import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import {
  EmployeePatch,
  EmployeeResponse,
} from 'src/app/shared/interfaces/Employee';
import { EmployeeInfoService } from 'src/app/shared/services/employee-info.service';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-employee-info',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './employee-info.component.html',
  styleUrls: ['./employee-info.component.scss'],
})
export class EmployeeInfoComponent
  extends DestroyBaseComponent
  implements OnInit
{
  constructor(private employeeInfoService: EmployeeInfoService) {
    super();
  }

  form = new FormGroup({
    mobile: new FormControl(''),
    homeTel: new FormControl(''),
    homeStreet: new FormControl(''),
    homeBuild: new FormControl(''),
    homeBlock: new FormControl(''),
    homeZip: new FormControl(''),
  });

  employee?: EmployeeResponse;
  isLoading = false;

  ngOnInit(): void {
    this.employeeInfoService
      .getEmployeeInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.employee = value[0];
          // console.log(this.employee);
          this.setInputsDefaultValues();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  setInputsDefaultValues() {
    this.form.get('mobile')?.setValue(this.employee?.mobile ?? '');
    this.form.get('homeTel')?.setValue(this.employee?.homeTel ?? '');
    this.form.get('homeStreet')?.setValue(this.employee?.homeStreet ?? '');
    this.form.get('homeBuild')?.setValue(this.employee?.homeBuild ?? '');
    this.form.get('homeBlock')?.setValue(this.employee?.homeBlock ?? '');
    this.form.get('homeZip')?.setValue(this.employee?.homeZip ?? '');
  }

  onSubmit() {
    this.isLoading = true;
    const formValues = this.form.value;
    const data: EmployeePatch = {
      employeeID: '',
      homeBlock: formValues.homeBlock!,
      homeZipCode: formValues.homeZip!,
      homeStreet: formValues.homeStreet!,
      homeBuildingFloorRoom: formValues.homeBuild!,
      mobilePhone: formValues.mobile!,
      homePhone: formValues.homeTel!,
    };
    this.employeeInfoService
      .updateEmployeeInfo(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          Swal.fire({
            title: 'Saved!',
            text: 'Information updated successfuly',
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
}
