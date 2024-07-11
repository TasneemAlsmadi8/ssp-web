import { TestBed } from '@angular/core/testing';

import { LoanBalanceService } from './loan-balance.service';

describe('LoanBalanceService', () => {
  let service: LoanBalanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoanBalanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
