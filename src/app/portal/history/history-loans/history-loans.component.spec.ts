import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryLoansComponent } from './history-loans.component';

describe('HistoryLoansComponent', () => {
  let component: HistoryLoansComponent;
  let fixture: ComponentFixture<HistoryLoansComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HistoryLoansComponent]
    });
    fixture = TestBed.createComponent(HistoryLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
