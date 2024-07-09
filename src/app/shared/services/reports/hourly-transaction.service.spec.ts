import { TestBed } from '@angular/core/testing';

import { HourlyTransactionReportService } from './hourly-transaction.service';

describe('HourlyTransactionService', () => {
  let service: HourlyTransactionReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HourlyTransactionReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
