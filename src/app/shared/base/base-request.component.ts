import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { LeaveRequestService } from 'src/app/shared/services/requests/leave.service';
import { LeaveRequest } from 'src/app/shared/interfaces/requests/leave';
import { takeUntil } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { GenericRequestService } from '../services/requests/generic-request.service';
import {
  AddSchema,
  Item,
  ItemType,
  UpdateSchema,
} from '../interfaces/requests/generic-request';

@Component({
  selector: 'app-base-request',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, PaginatedTableComponent],
  template: '',
})
export abstract class BaseRequestsComponent<
    T extends Item,
    U extends UpdateSchema,
    A extends AddSchema,
    V extends ItemType,
    RequestService extends GenericRequestService<T, U, A, V>
  >
  extends DestroyBaseComponent
  implements OnInit
{
  items: T[] = [];
  activePageItems: T[] = [];
  faCancel = faBan;
  protected service = inject(RequestService);

  constructor() {
    super();
    this.service = inject(RequestService)
    this.service.items$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.items = value;
    });
  }

  ngOnInit(): void {
    this.service
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          // this.items = value;
          // console.log(value);
          // this.setInputsDefaultValues();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  cancelItem(item: T) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Canceling...',
          text: 'Please wait while we cancel your request.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        this.service
          .cancel(item.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (value) => {
              Swal.fire({
                title: 'Canceled!',
                text: 'Your request has been canceled.',
                icon: 'success',
              });
            },
            error: (err) => {
              console.log(err);
              Swal.fire({
                title: 'Error!',
                text: 'There was an error canceling your request.',
                icon: 'error',
              });
            },
          });
      }
    });
  }

  trackByItemId(index: number, item: T): number {
    return parseInt(item.id);
  }
}
