import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-request-details-button',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslateModule],
  templateUrl: './request-details-button.component.html',
  styleUrls: ['./request-details-button.component.scss'],
})
export class RequestDetailsButtonComponent {
  @Input() isEditable = true;
  @Output() click = new EventEmitter<void>();

  onClick() {
    this.click.emit();
  }

  faEdit = faPenToSquare;
  faView = faEye;
}
