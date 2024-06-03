import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-approval-accept-button',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslateModule],
  template: `
    <button
      title="Accept"
      (click)="onClick()"
      class="font-bold text-lg text-green-600 hover:bg-blue-100 w-6 h-7 rounded relative"
    >
      <fa-icon [icon]="faAccept" class="relative bottom-0.5"></fa-icon>
    </button>
  `,
  styleUrls: ['./approval-accept-button.component.scss'],
})
export class ApprovalAcceptButtonComponent {
  @Output() click = new EventEmitter<void>();

  onClick() {
    this.click.emit();
  }

  faAccept = faCheck;
}
