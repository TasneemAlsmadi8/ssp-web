import { TestBed } from '@angular/core/testing';

import { ValueTransactionRequestService } from './value-transaction.service';

describe('ValueTransactionsService', () => {
  let service: ValueTransactionRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValueTransactionRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
