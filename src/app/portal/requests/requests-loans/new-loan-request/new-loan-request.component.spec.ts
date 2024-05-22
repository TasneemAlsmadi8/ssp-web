import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLeaveRequestComponent } from './new-loan-request.component';

describe('NewLeaveRequestComponent', () => {
  let component: NewLeaveRequestComponent;
  let fixture: ComponentFixture<NewLeaveRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NewLeaveRequestComponent]
    });
    fixture = TestBed.createComponent(NewLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
