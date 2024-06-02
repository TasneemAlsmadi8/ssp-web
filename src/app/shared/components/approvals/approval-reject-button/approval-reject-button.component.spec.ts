import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalRejectButtonComponent } from './approval-reject-button.component';

describe('ApprovalRejectButtonComponent', () => {
  let component: ApprovalRejectButtonComponent;
  let fixture: ComponentFixture<ApprovalRejectButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApprovalRejectButtonComponent]
    });
    fixture = TestBed.createComponent(ApprovalRejectButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
