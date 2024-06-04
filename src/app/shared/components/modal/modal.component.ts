import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * @slot openButton - The button that opens the modal.
 * @slot modalTitle - The title of the modal.
 * @slot acceptButton - The button to confirm or accept an action.
 * @slot cancelButton - The button to cancel or close the modal.
 * @slot any other (without selector) - The main content of the modal.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() set isModalOpen(value: boolean) {
    this._isModalOpen = value;
    this.isModalOpenChange.emit(value);
  }
  @Input() modalClasses: string = '';
  @Input() isFooterHidden: boolean = false;
  @Output() isModalOpenChange = new EventEmitter<boolean>();
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onAccept: EventEmitter<any> = new EventEmitter();

  private _isModalOpen: boolean = false;
  public get isModalOpen(): boolean {
    return this._isModalOpen;
  }

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
