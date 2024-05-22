import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveRequestDetailsComponent } from './leave-request-details.component';

describe('EditLeaveRequestComponent', () => {
  let component: LeaveRequestDetailsComponent;
  let fixture: ComponentFixture<LeaveRequestDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LeaveRequestDetailsComponent],
    });
    fixture = TestBed.createComponent(LeaveRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
