import { TestBed } from '@angular/core/testing';

import { ShiftSystemService } from './shift-system.service';

describe('ShiftSystemService', () => {
  let service: ShiftSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShiftSystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
