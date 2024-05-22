import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewValueTransactionRequestComponent } from './new-value-transaction-request.component';

describe('NewValueTransactionRequestComponent', () => {
  let component: NewValueTransactionRequestComponent;
  let fixture: ComponentFixture<NewValueTransactionRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NewValueTransactionRequestComponent]
    });
    fixture = TestBed.createComponent(NewValueTransactionRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
