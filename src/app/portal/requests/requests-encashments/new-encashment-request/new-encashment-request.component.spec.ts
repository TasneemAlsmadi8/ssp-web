import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEncashmentRequestComponent } from './new-encashment-request.component';

describe('NewEncashmentRequestComponent', () => {
  let component: NewEncashmentRequestComponent;
  let fixture: ComponentFixture<NewEncashmentRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NewEncashmentRequestComponent]
    });
    fixture = TestBed.createComponent(NewEncashmentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
