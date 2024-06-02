import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-approval-speed-dial',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './approval-speed-dial.component.html',
  styleUrls: ['./approval-speed-dial.component.scss'],
})
export class ApprovalSpeedDialComponent {
  faAccept = faCheck;
  faReject = faBan;
}
