import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncashmentsDetailsComponent } from './encashments-details.component';

describe('EncashmentsDetailsComponent', () => {
  let component: EncashmentsDetailsComponent;
  let fixture: ComponentFixture<EncashmentsDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EncashmentsDetailsComponent]
    });
    fixture = TestBed.createComponent(EncashmentsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
