import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncashmentRequestDetailsComponent } from './encashment-request-details.component';

describe('EncashmentRequestDetailsComponent', () => {
  let component: EncashmentRequestDetailsComponent;
  let fixture: ComponentFixture<EncashmentRequestDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EncashmentRequestDetailsComponent]
    });
    fixture = TestBed.createComponent(EncashmentRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
