import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelRequestPopupComponent } from './CancelRequestPopupComponent';

describe('CancelRequestPopupComponent', () => {
  let component: CancelRequestPopupComponent;
  let fixture: ComponentFixture<CancelRequestPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CancelRequestPopupComponent],
    });
    fixture = TestBed.createComponent(CancelRequestPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
