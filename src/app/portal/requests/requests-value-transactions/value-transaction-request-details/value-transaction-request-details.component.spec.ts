import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueTransactionRequestDetailsComponent } from './value-transaction-request-details.component';

describe('ValueTransactionRequestDetailsComponent', () => {
  let component: ValueTransactionRequestDetailsComponent;
  let fixture: ComponentFixture<ValueTransactionRequestDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ValueTransactionRequestDetailsComponent]
    });
    fixture = TestBed.createComponent(ValueTransactionRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
