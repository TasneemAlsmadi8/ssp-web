import { Component, Inject, OnInit } from '@angular/core';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { Item } from 'src/app/shared/interfaces/generic-item';
import { takeUntil } from 'rxjs';
import { GenericHistoryService } from '../../services/history/generic-history.service';
import { HttpErrorResponse } from '@angular/common/http';

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

  isLoading: boolean = false;
  isError: boolean = false;
  errorMessage?: string;

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
    this.isLoading = true;
    this.historyService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          console.log(value);
          this.isError = false;
        },
        error: (err: HttpErrorResponse) => {
          console.log(err.error);
          this.errorMessage = err.error;
          this.isError = true;
        },
      })
      .add(() => {
        this.isLoading = false;
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
