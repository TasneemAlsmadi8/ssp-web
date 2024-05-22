import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimeRequestDetailsComponent } from './overtime-request-details.component';

describe('OvertimeRequestDetailsComponent', () => {
  let component: OvertimeRequestDetailsComponent;
  let fixture: ComponentFixture<OvertimeRequestDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OvertimeRequestDetailsComponent]
    });
    fixture = TestBed.createComponent(OvertimeRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
