import { TestBed } from '@angular/core/testing';

import { LeaveRequestService } from './leave.service';

describe('LeaveService', () => {
  let service: LeaveRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaveRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
