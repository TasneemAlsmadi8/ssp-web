import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryLeavesComponent } from './history-leaves.component';

describe('HistoryLeavesComponent', () => {
  let component: HistoryLeavesComponent;
  let fixture: ComponentFixture<HistoryLeavesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HistoryLeavesComponent]
    });
    fixture = TestBed.createComponent(HistoryLeavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
