import { TestBed } from '@angular/core/testing';

import { ValueTransactionService } from './value-transaction.service';

describe('ValueTransactionService', () => {
  let service: ValueTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValueTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
