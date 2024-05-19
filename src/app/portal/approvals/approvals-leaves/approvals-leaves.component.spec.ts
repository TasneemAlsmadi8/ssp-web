import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalsLeavesComponent } from './approvals-leaves.component';

describe('ApprovalsLeavesComponent', () => {
  let component: ApprovalsLeavesComponent;
  let fixture: ComponentFixture<ApprovalsLeavesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApprovalsLeavesComponent]
    });
    fixture = TestBed.createComponent(ApprovalsLeavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
