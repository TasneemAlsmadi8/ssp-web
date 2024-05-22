import { Component } from '@angular/core';

@Component({
  selector: 'app-drop-down-Items',
  standalone: true,
  templateUrl: './drop-down-links.component.html',
  styleUrls: ['./drop-down-links.component.scss'],
})
export class DropDownItemsComponent {
  isOpen = false;
  toggleMenu() {
    this.isOpen = !this.isOpen;
  }
}
