import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() isModalOpen: boolean = false;
  @Input() modalClasses: string = '';
  @Input() isFooterHidden: boolean = false;
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onAccept: EventEmitter<any> = new EventEmitter();

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  cancel() {
    this.onCancel.emit();
    this.toggleModal();
  }

  accept() {
    this.onAccept.emit();
    this.toggleModal();
  }
}
