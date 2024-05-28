import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestDetailsButtonComponent } from './request-details-button.component';

describe('RequestDetailsButtonComponent', () => {
  let component: RequestDetailsButtonComponent;
  let fixture: ComponentFixture<RequestDetailsButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestDetailsButtonComponent]
    });
    fixture = TestBed.createComponent(RequestDetailsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
