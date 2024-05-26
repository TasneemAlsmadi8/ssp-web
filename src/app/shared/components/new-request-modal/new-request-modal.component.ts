import { Component, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { FormGroup } from '@angular/forms';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-new-request-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './new-request-modal.component.html',
  styleUrls: ['./new-request-modal.component.scss'],
})
export class NewRequestModalComponent {
  @Input({ required: true }) title!: string;
}

export interface GenericNewRequestComponent<T, A> {
  onSave: EventEmitter<T>;
  isLoading: boolean;
  user: User;
  item: T;
  form: FormGroup;
  formControls: { [key: string]: any[] };
  defaultValues: { [key: string]: any };
  mapFormToAddRequest(formValues: any): A;
  setInputsDefaultValues(): void;
  updateDynamicValues?(): void;
  onSubmit(): void;
}
