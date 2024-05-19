import { Component, Input } from '@angular/core';
import {
  faAngleDown,
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

  @Input({ required: true }) user!: User;
}
