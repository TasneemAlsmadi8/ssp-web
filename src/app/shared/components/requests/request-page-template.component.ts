import { Component, Inject, OnInit } from '@angular/core';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { GenericRequestService } from 'src/app/shared/services/requests/generic-request.service';
import { Item } from 'src/app/shared/interfaces/requests/generic-request';
import { takeUntil } from 'rxjs';

@Component({
  standalone: true,
  template: '',
})
export abstract class RequestPageComponentTemplate<T extends Item>
  extends DestroyBaseComponent
  implements OnInit
{
  items: T[] = [];
  activePageItems: T[] = [];

  activeItemDetails?: T;
  ItemDetailsOpen = false;

  abstract trackByRequestId(index: number, item: T): number;

  constructor(
    @Inject(null)
    private requestService: GenericRequestService<T, any, any, any>
  ) {
    super();
    requestService.list$.subscribe((value) => {
      this.items = value;
    });
  }

  ngOnInit(): void {
    this.requestService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          console.log(value);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  setActiveItemDetails(activeItemDetails: T) {
    this.activeItemDetails = activeItemDetails;
    this.ItemDetailsOpen = true;
  }
}
