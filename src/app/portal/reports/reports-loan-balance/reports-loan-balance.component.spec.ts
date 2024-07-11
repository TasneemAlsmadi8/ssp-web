import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsLoanBalanceComponent } from './reports-loan-balance.component';

describe('ReportsLoanBalanceComponent', () => {
  let component: ReportsLoanBalanceComponent;
  let fixture: ComponentFixture<ReportsLoanBalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReportsLoanBalanceComponent]
    });
    fixture = TestBed.createComponent(ReportsLoanBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
