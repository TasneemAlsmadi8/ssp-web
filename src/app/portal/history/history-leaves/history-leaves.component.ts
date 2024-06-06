import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PaginatedTableComponent } from 'src/app/shared/components/paginated-table/paginated-table.component';
import { RequestDetailsButtonComponent } from 'src/app/shared/components/requests/request-details-button/request-details-button.component';
import { LeaveRequestDetailsComponent } from '../../requests/requests-leaves/leave-request-details/leave-request-details.component';
import { HistoryPageComponentTemplate } from 'src/app/shared/components/history/history-page-template.component';
import { LeaveHistoryService } from 'src/app/shared/services/history/leave.service';
import { LeaveHistory } from 'src/app/shared/interfaces/history/leave';
import { LeaveRequest } from 'src/app/shared/interfaces/requests/leave';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-history-leaves',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    LeaveRequestDetailsComponent,
    RequestDetailsButtonComponent,
    PaginatedTableComponent,
    TranslateModule,
  ],
  templateUrl: './history-leaves.component.html',
  styleUrls: ['./history-leaves.component.scss'],
})
export class HistoryLeavesComponent extends HistoryPageComponentTemplate<
  LeaveHistory,
  LeaveRequest
> {
  constructor(protected leaveService: LeaveHistoryService) {
    super(leaveService);
  }

  override getItemId(item: LeaveHistory): number {
    return parseInt(item.id);
  }
  override mapHistoryToUpdateRequest(item: LeaveHistory): LeaveRequest {
    const data: LeaveRequest = {
      id: item.id,
      leaveType: item.leaveType,
      fromDate: item.fromDate,
      toDate: item.toDate,
      fromTime: item.fromTime,
      toTime: item.toTime,
      remarks: item.remarks,
      status: 'Pending',
      leaveCode: item.leaveCode,
      paidDays: 0,
      unpaidDays: 0,

      employeeId: item.employeeId,
      employeeCode: item.employeeCode,
      fullName: item.fullName,
      fullNameF: item.fullNameF,
    };
    return data;
  }
}
