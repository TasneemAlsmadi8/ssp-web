import { Component, Inject, OnInit } from '@angular/core';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { GenericRequestService } from 'src/app/shared/services/requests/generic-request.service';
import { Item } from 'src/app/shared/interfaces/generic-item';
import { takeUntil } from 'rxjs';

@Component({
  standalone: true,
  template: '',
})
export abstract class RequestPageComponentTemplate<Request extends Item>
  extends DestroyBaseComponent
  implements OnInit
{
  items: Request[] = [];
  activePageItems: Request[] = [];

  activeItemDetails?: Request;
  ItemDetailsOpen = false;

  abstract trackByRequestId(index: number, item: Request): number;

  constructor(
    @Inject(null)
    private requestService: GenericRequestService<Request, any, any, any>
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

  isEditable(item: Request): boolean {
    return item.status === 'Pending' || item.status === 'Rejected';
  }

  isCancelable(item: Request): boolean {
    return item.status === 'Pending';
  }

  setActiveItemDetails(activeItemDetails: Request) {
    this.activeItemDetails = activeItemDetails;
    this.ItemDetailsOpen = true;
  }
}
