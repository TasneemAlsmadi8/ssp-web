import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestDetailsModalComponent } from './request-details-modal.component';

describe('RequestDetailsModalComponent', () => {
  let component: RequestDetailsModalComponent;
  let fixture: ComponentFixture<RequestDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestDetailsModalComponent]
    });
    fixture = TestBed.createComponent(RequestDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
