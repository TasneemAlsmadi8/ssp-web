import { Component, Inject, OnInit } from '@angular/core';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { Item } from 'src/app/shared/interfaces/generic-item';
import { takeUntil } from 'rxjs';
import { GenericHistoryService } from '../../services/history/generic-history.service';

@Component({
  standalone: true,
  template: '',
})
export abstract class HistoryPageComponentTemplate<
    History extends Item,
    Request extends Item
  >
  extends DestroyBaseComponent
  implements OnInit
{
  items: History[] = [];
  activePageItems: History[] = [];

  activeItemEmployeeId?: string;
  activeItemDetails?: Request;
  ItemDetailsOpen = false;

  abstract getItemId(item: History): number;
  abstract mapHistoryToUpdateRequest(item: History): Request;

  constructor(
    @Inject(null)
    private historyService: GenericHistoryService<History>
  ) {
    super();
    historyService.list$.subscribe((value) => {
      this.items = value;
    });
  }

  ngOnInit(): void {
    this.historyService
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

  refreshItems() {
    this.historyService.getAll().pipe(takeUntil(this.destroy$)).subscribe();
  }

  trackById = (index: number, item: History): number => {
    return this.getItemId(item);
  };

  setActiveItemDetails(activeItemDetails: History) {
    this.activeItemDetails = this.mapHistoryToUpdateRequest(activeItemDetails);
    this.activeItemEmployeeId = activeItemDetails.employeeId;
    this.ItemDetailsOpen = true;
  }
}
