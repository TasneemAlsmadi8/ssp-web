import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsLeavesComponent } from './requests-leaves.component';

describe('RequestsLeavesComponent', () => {
  let component: RequestsLeavesComponent;
  let fixture: ComponentFixture<RequestsLeavesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestsLeavesComponent]
    });
    fixture = TestBed.createComponent(RequestsLeavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
