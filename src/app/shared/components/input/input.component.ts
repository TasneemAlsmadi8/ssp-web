import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent {
  // @Input({ required: true }) formControl!: FormControl;
  @Input({ required: true }) title!: string;
  @Input() errorMsg: string = 'error!';
}
