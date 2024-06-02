import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalApproveButtonComponent } from './approval-accept-button.component';

describe('ApprovalAcceptButtonComponent', () => {
  let component: ApprovalApproveButtonComponent;
  let fixture: ComponentFixture<ApprovalApproveButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApprovalApproveButtonComponent],
    });
    fixture = TestBed.createComponent(ApprovalApproveButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
