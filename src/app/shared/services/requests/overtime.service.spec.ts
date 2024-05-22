import { TestBed } from '@angular/core/testing';

import { OvertimeRequestService } from './overtime.service';

describe('OvertimeService', () => {
  let service: OvertimeRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OvertimeRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
