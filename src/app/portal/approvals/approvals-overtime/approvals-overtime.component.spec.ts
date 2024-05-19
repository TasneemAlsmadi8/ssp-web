import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalsOvertimeComponent } from './approvals-overtime.component';

describe('ApprovalsOvertimeComponent', () => {
  let component: ApprovalsOvertimeComponent;
  let fixture: ComponentFixture<ApprovalsOvertimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApprovalsOvertimeComponent]
    });
    fixture = TestBed.createComponent(ApprovalsOvertimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
