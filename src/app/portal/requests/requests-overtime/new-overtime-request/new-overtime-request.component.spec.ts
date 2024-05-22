import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOvertimeRequestComponent } from './new-overtime-request.component';

describe('NewOvertimeRequestComponent', () => {
  let component: NewOvertimeRequestComponent;
  let fixture: ComponentFixture<NewOvertimeRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NewOvertimeRequestComponent]
    });
    fixture = TestBed.createComponent(NewOvertimeRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
