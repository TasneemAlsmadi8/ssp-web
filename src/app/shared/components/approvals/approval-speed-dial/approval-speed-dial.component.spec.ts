import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalSpeedDialComponent } from './approval-speed-dial.component';

describe('ApprovalSpeedDialComponent', () => {
  let component: ApprovalSpeedDialComponent;
  let fixture: ComponentFixture<ApprovalSpeedDialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApprovalSpeedDialComponent]
    });
    fixture = TestBed.createComponent(ApprovalSpeedDialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
