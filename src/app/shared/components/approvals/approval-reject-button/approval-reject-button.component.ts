import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-approval-reject-button',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslateModule],
  template: `
    <button
      title="Reject"
      (click)="onClick()"
      class="font-medium text-red-600 hover:bg-blue-100 w-6 h-7 rounded p-1"
    >
      <fa-icon [icon]="faReject"></fa-icon>
    </button>
  `,
  styleUrls: ['./approval-reject-button.component.scss'],
})
export class ApprovalRejectButtonComponent {
  @Output() click = new EventEmitter<void>();

  onClick() {
    this.click.emit();
  }

  faReject = faBan;
}
