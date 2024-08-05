import { Component, Input } from '@angular/core';
import {
  faAngleDown,
  faCaretDown,
  faUser,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons';
import { User } from 'src/app/shared/interfaces/user';
// import { DropDownLinksComponent } from './drop-down-links/drop-down-links.component';

@Component({
  selector: 'app-side-bar-content',
  templateUrl: './side-bar-content.component.html',
  styleUrls: ['./side-bar-content.component.scss'],
})
export class SideBarContentComponent {
  faGears = faUserGear;
  faUser = faUser;
  faDownArrow = faAngleDown;
  faCaretDown = faCaretDown;

  @Input({ required: true }) user!: User;

  openDropdown: string | null = null;

  toggleDropdown(name: string) {
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  isDropdownOpen(name: string): boolean {
    return this.openDropdown === name;
  }
}
