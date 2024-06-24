import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsLeaveBalanceComponent } from './reports-leave-balance.component';

describe('ReportsLeaveBalanceComponent', () => {
  let component: ReportsLeaveBalanceComponent;
  let fixture: ComponentFixture<ReportsLeaveBalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReportsLeaveBalanceComponent]
    });
    fixture = TestBed.createComponent(ReportsLeaveBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
