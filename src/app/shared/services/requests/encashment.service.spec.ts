import { TestBed } from '@angular/core/testing';

import { EncashmentRequestService } from './encashment.service';

describe('EncashmentsService', () => {
  let service: EncashmentRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncashmentRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
