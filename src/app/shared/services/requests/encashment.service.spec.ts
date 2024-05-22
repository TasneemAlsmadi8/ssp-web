import { TestBed } from '@angular/core/testing';

import { EncashmentService } from './encashment.service';

describe('EncashmentsService', () => {
  let service: EncashmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncashmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
