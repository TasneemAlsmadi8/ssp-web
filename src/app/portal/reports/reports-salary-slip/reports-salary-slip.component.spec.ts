import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsSalarySlipComponent } from './reports-salary-slip.component';

describe('ReportsSalarySlipComponent', () => {
  let component: ReportsSalarySlipComponent;
  let fixture: ComponentFixture<ReportsSalarySlipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReportsSalarySlipComponent]
    });
    fixture = TestBed.createComponent(ReportsSalarySlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
