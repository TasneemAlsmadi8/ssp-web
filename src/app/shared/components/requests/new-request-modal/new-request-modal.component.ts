import { Component, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../modal/modal.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-new-request-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, TranslateModule],
  templateUrl: './new-request-modal.component.html',
  styleUrls: ['./new-request-modal.component.scss'],
})
export class NewRequestModalComponent {
  @Input({ required: true }) title!: string;
}
