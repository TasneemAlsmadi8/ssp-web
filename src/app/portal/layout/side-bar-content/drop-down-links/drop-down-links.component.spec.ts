import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownLinksComponent } from './drop-down-links.component';

describe('DropDownLinksComponent', () => {
  let component: DropDownLinksComponent;
  let fixture: ComponentFixture<DropDownLinksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DropDownLinksComponent]
    });
    fixture = TestBed.createComponent(DropDownLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
