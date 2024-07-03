import { TestBed } from '@angular/core/testing';

import { SalarySlipReportService } from './salary-slip.service';

describe('SalarySlipService', () => {
  let service: SalarySlipReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalarySlipReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
