import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsLoansComponent } from './requests-loans.component';

describe('RequestsLoansComponent', () => {
  let component: RequestsLoansComponent;
  let fixture: ComponentFixture<RequestsLoansComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestsLoansComponent]
    });
    fixture = TestBed.createComponent(RequestsLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
