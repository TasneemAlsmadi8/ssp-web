import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsEncashmentsComponent } from './requests-encashments.component';

describe('RequestsEncashmentsComponent', () => {
  let component: RequestsEncashmentsComponent;
  let fixture: ComponentFixture<RequestsEncashmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestsEncashmentsComponent]
    });
    fixture = TestBed.createComponent(RequestsEncashmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
