import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalsValueTransactionsComponent } from './approvals-value-transactions.component';

describe('ApprovalsValueTransactionsComponent', () => {
  let component: ApprovalsValueTransactionsComponent;
  let fixture: ComponentFixture<ApprovalsValueTransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApprovalsValueTransactionsComponent]
    });
    fixture = TestBed.createComponent(ApprovalsValueTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
