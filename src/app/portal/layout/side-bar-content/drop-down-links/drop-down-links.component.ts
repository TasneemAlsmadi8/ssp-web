import { Component } from '@angular/core';

@Component({
  selector: 'app-drop-down-links',
  standalone: true,
  templateUrl: './drop-down-links.component.html',
  styleUrls: ['./drop-down-links.component.scss'],
})
export class DropDownLinksComponent {
  isOpen = false;
  toggleMenu() {
    this.isOpen = !this.isOpen;
    console.log('first');
  }
}
