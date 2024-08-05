import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-drop-down-Items',
  standalone: true,
  imports: [NgClass],
  templateUrl: './drop-down-links.component.html',
  styleUrls: ['./drop-down-links.component.scss'],
})
export class DropDownItemsComponent {
  @Input({ required: true }) isOpen = false;
  @Input({ required: true }) name!: string;
  @Output() toggle = new EventEmitter<string>();

  toggleMenu() {
    this.toggle.emit(this.name);
  }
}
