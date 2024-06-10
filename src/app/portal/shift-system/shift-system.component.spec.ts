import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftSystemComponent } from './shift-system.component';

describe('ShiftSystemComponent', () => {
  let component: ShiftSystemComponent;
  let fixture: ComponentFixture<ShiftSystemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShiftSystemComponent]
    });
    fixture = TestBed.createComponent(ShiftSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
