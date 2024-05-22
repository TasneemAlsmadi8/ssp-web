import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatedTableComponent } from './paginated-table.component';

describe('PaginatedTableComponent', () => {
  let component: PaginatedTableComponent;
  let fixture: ComponentFixture<PaginatedTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaginatedTableComponent]
    });
    fixture = TestBed.createComponent(PaginatedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
