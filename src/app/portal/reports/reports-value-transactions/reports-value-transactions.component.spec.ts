import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsValueTransactionsComponent } from './reports-value-transactions.component';

describe('ReportsValueTransactionsComponent', () => {
  let component: ReportsValueTransactionsComponent;
  let fixture: ComponentFixture<ReportsValueTransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReportsValueTransactionsComponent]
    });
    fixture = TestBed.createComponent(ReportsValueTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
