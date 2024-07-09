import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsHourlyTransactionsComponent } from './reports-hourly-transactions.component';

describe('ReportsHourlyTransactionsComponent', () => {
  let component: ReportsHourlyTransactionsComponent;
  let fixture: ComponentFixture<ReportsHourlyTransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReportsHourlyTransactionsComponent]
    });
    fixture = TestBed.createComponent(ReportsHourlyTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
