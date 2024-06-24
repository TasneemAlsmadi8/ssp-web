import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { authGuard } from '../shared/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'employee-info',
      },
      {
        path: 'employee-info',
        title: 'Employee info',
        loadComponent: () =>
          import('./employee-info/employee-info.component').then(
            (m) => m.EmployeeInfoComponent
          ),
      },
      {
        path: 'requests/leaves',
        title: 'requests',
        loadComponent: () =>
          import('./requests/requests-leaves/requests-leaves.component').then(
            (m) => m.RequestsLeavesComponent
          ),
      },
      {
        path: 'requests/loans',
        title: 'requests',
        loadComponent: () =>
          import('./requests/requests-loans/requests-loans.component').then(
            (m) => m.RequestsLoansComponent
          ),
      },
      {
        path: 'requests/overtime',
        title: 'requests',
        loadComponent: () =>
          import(
            './requests/requests-overtime/requests-overtime.component'
          ).then((m) => m.RequestsOvertimeComponent),
      },
      {
        path: 'requests/value-transactions',
        title: 'requests',
        loadComponent: () =>
          import(
            './requests/requests-value-transactions/requests-value-transactions.component'
          ).then((m) => m.RequestsValueTransactionsComponent),
      },
      {
        path: 'requests/encashments',
        title: 'requests',
        loadComponent: () =>
          import(
            './requests/requests-encashments/requests-encashments.component'
          ).then((m) => m.RequestsEncashmentsComponent),
      },
      {
        path: 'approvals/leaves',
        title: 'approvals',
        loadComponent: () =>
          import(
            './approvals/approvals-leaves/approvals-leaves.component'
          ).then((m) => m.ApprovalsLeavesComponent),
      },
      {
        path: 'approvals/loans',
        title: 'approvals',
        loadComponent: () =>
          import('./approvals/approvals-loans/approvals-loans.component').then(
            (m) => m.ApprovalsLoansComponent
          ),
      },
      {
        path: 'approvals/overtime',
        title: 'approvals',
        loadComponent: () =>
          import(
            './approvals/approvals-overtime/approvals-overtime.component'
          ).then((m) => m.ApprovalsOvertimeComponent),
      },
      {
        path: 'approvals/value-transactions',
        title: 'approvals',
        loadComponent: () =>
          import(
            './approvals/approvals-value-transactions/approvals-value-transactions.component'
          ).then((m) => m.ApprovalsValueTransactionsComponent),
      },
      {
        path: 'approvals/encashments',
        title: 'approvals',
        loadComponent: () =>
          import(
            './approvals/approvals-encashments/approvals-encashments.component'
          ).then((m) => m.ApprovalsEncashmentsComponent),
      },
      {
        path: 'history/leaves',
        title: 'history',
        loadComponent: () =>
          import('./history/history-leaves/history-leaves.component').then(
            (m) => m.HistoryLeavesComponent
          ),
      },
      {
        path: 'history/loans',
        title: 'history',
        loadComponent: () =>
          import('./history/history-loans/history-loans.component').then(
            (m) => m.HistoryLoansComponent
          ),
      },
      {
        path: 'shift-system',
        title: 'Shift System',
        loadComponent: () =>
          import('./shift-system/shift-system.component').then(
            (m) => m.ShiftSystemComponent
          ),
      },

      {
        path: 'reports/leave-balance',
        title: 'Leave Balance Report',
        loadComponent: () =>
          import(
            './reports/reports-leave-balance/reports-leave-balance.component'
          ).then((m) => m.ReportsLeaveBalanceComponent),
      },
      { path: '**', component: PageNotFoundComponent },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortalRoutingModule {}
