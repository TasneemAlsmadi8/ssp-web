import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsOvertimeComponent } from './requests-overtime.component';

describe('RequestsOvertimeComponent', () => {
  let component: RequestsOvertimeComponent;
  let fixture: ComponentFixture<RequestsOvertimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestsOvertimeComponent]
    });
    fixture = TestBed.createComponent(RequestsOvertimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
