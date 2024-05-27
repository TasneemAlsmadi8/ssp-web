import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faPenToSquare } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-request-details-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, FontAwesomeModule],
  templateUrl: './request-details-modal.component.html',
  styleUrls: ['./request-details-modal.component.scss'],
})
export class RequestDetailsModalComponent {
  @Input({ required: true }) requestType!: string;
  @Input() requestId?: string;
  @Input() isEditable = true;
  faEdit = faPenToSquare;
  faView = faEye;
}
