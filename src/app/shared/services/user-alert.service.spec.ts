import { TestBed } from '@angular/core/testing';

import { UserAlertService } from './user-alert.service';

describe('UserAlertService', () => {
  let service: UserAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
