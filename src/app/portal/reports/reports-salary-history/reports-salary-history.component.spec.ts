import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsSalaryHistoryComponent } from './reports-salary-history.component';

describe('ReportsSalaryHistoryComponent', () => {
  let component: ReportsSalaryHistoryComponent;
  let fixture: ComponentFixture<ReportsSalaryHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReportsSalaryHistoryComponent],
    });
    fixture = TestBed.createComponent(ReportsSalaryHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
