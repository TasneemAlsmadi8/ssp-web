import { TestBed } from '@angular/core/testing';

import { SalaryHistoryReportService } from './salary-history.service';

describe('SalaryHistoryService', () => {
  let service: SalaryHistoryReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalaryHistoryReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
