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
