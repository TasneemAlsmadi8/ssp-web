import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalsEncashmentsComponent } from './approvals-encashments.component';

describe('ApprovalsEncashmentsComponent', () => {
  let component: ApprovalsEncashmentsComponent;
  let fixture: ComponentFixture<ApprovalsEncashmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApprovalsEncashmentsComponent]
    });
    fixture = TestBed.createComponent(ApprovalsEncashmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
