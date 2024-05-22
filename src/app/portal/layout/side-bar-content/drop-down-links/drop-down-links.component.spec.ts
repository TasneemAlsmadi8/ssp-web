import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownItemsComponent } from './drop-down-links.component';

describe('DropDownLinksComponent', () => {
  let component: DropDownItemsComponent;
  let fixture: ComponentFixture<DropDownItemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DropDownItemsComponent],
    });
    fixture = TestBed.createComponent(DropDownItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
