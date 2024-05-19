import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalsLoansComponent } from './approvals-loans.component';

describe('ApprovalsLoansComponent', () => {
  let component: ApprovalsLoansComponent;
  let fixture: ComponentFixture<ApprovalsLoansComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApprovalsLoansComponent]
    });
    fixture = TestBed.createComponent(ApprovalsLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
