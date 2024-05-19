import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsValueTransactionsComponent } from './requests-value-transactions.component';

describe('RequestsValueTransactionsComponent', () => {
  let component: RequestsValueTransactionsComponent;
  let fixture: ComponentFixture<RequestsValueTransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestsValueTransactionsComponent]
    });
    fixture = TestBed.createComponent(RequestsValueTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
