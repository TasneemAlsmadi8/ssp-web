import { Component, Inject, OnInit, inject } from '@angular/core';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { Item, UpdateSchema } from 'src/app/shared/interfaces/generic-item';
import { takeUntil } from 'rxjs';
import { GenericApprovalService } from '../../services/approvals/generic-approval.service';
import { SelectedItems } from '../../utils/selected-items';
import { UserAlertService } from '../../services/user-alert.service';
import { GenericApproval } from '../../interfaces/approvals/shared';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  template: '',
})
export abstract class ApprovalPageComponentTemplate<
    Approval extends GenericApproval,
    Request extends Item
  >
  extends DestroyBaseComponent
  implements OnInit
{
  private userAlertService: UserAlertService;
  items: Approval[] = [];
  activePageItems: Approval[] = [];

  selectedItems: SelectedItems<Approval> = new SelectedItems();

  activeItemEmployeeId?: string;
  activeItemDetails?: Request;
  ItemDetailsOpen = false;

  isLoading: boolean = false;
  isError: boolean = false;
  errorMessage?: string;

  abstract getItemId(item: Approval): number;
  abstract mapApprovalToUpdateRequest(item: Approval): Request;

  constructor(
    @Inject(null)
    private approvalService: GenericApprovalService<Approval>
  ) {
    super();
    this.userAlertService = inject(UserAlertService);
    approvalService.list$.subscribe((value) => {
      this.items = value;
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.approvalService
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
    this.approvalService.getAll().pipe(takeUntil(this.destroy$)).subscribe();
  }

  approveRequest(id: string): void {
    this.userAlertService
      .confirmAction('Are you sure?', '', 'Yes, approve', 'No')
      .subscribe((isConfirmed) => {
        if (isConfirmed) {
          this.userAlertService.showLoading(
            'Approving...',
            'Please wait while we approve request.'
          );

          this.approvalService
            .approve(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (value) => {
                this.userAlertService.showSuccess('Approved!', '');
              },
              error: (err) => {
                console.log(err);
                this.userAlertService.showError(
                  'Error!',
                  'There was an error approving request.'
                );
              },
            });
        }
      });
  }

  rejectRequest(id: string): void {
    this.userAlertService
      .confirmAction('Are you sure?', '', 'Yes, reject', 'No')
      .subscribe((isConfirmed) => {
        if (isConfirmed) {
          this.userAlertService.showLoading(
            'Rejecting...',
            'Please wait while we reject request.'
          );

          this.approvalService
            .reject(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (value) => {
                this.userAlertService.showSuccess('Rejected!', '');
              },
              error: (err) => {
                console.log(err);
                this.userAlertService.showError(
                  'Error!',
                  'There was an error rejecting request.'
                );
              },
            });
        }
      });
  }

  trackById = (index: number, item: Approval): number => {
    return this.getItemId(item);
  };

  isEditable(item: Approval): boolean {
    return item.status === 'Pending' || item.status === 'Rejected';
  }

  setActiveItemDetails(activeItemDetails: Approval) {
    this.activeItemDetails = this.mapApprovalToUpdateRequest(activeItemDetails);
    this.activeItemEmployeeId = activeItemDetails.employeeId;
    this.ItemDetailsOpen = true;
  }

  toggleItemSelection(item: Approval): void {
    const id = this.getItemId(item).toString();
    this.selectedItems.toggle(id, item);
  }

  isSelected(item: Approval): boolean {
    const id = this.getItemId(item).toString();
    return this.selectedItems.has(id);
  }

  isAllSelected(): boolean {
    return this.items.length === this.selectedItems.length;
  }

  onSelectAll(event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      for (const item of this.items) {
        const id = this.getItemId(item).toString();
        this.selectedItems.add(id, item);
      }
    } else {
      this.selectedItems.clear();
    }
  }
}
