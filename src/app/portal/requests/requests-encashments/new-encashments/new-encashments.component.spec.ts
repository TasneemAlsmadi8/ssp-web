import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEncashmentsComponent } from './new-encashments.component';

describe('NewEncashmentsComponent', () => {
  let component: NewEncashmentsComponent;
  let fixture: ComponentFixture<NewEncashmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NewEncashmentsComponent]
    });
    fixture = TestBed.createComponent(NewEncashmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
