import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircleInfo,
  faInfo,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div
      *ngIf="message"
      class="flex items-center p-4 mx-2 my-4 text-sm border rounded-lg"
      [ngClass]="[bgColorClass, customClasses]"
      role="alert"
    >
      <fa-icon
        [icon]="faInfo"
        class="flex-shrink-0 inline w-4 h-4 mr-3 relative bottom-1.5 text-lg"
        aria-hidden="true"
      ></fa-icon>
      <span class="sr-only">{{ title }}</span>
      <div>
        <strong>{{ title }}</strong> {{ message }}
      </div>
    </div>
  `,
  styles: [],
})
export class AlertComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() color: 'red' | 'green' | 'blue' | 'yellow' = 'red';
  @Input() customClasses: string = '';

  faInfo = faCircleInfo;

  constructor() {}

  get bgColorClass() {
    let baseClass = '';
    if (this.color === 'red') {
      baseClass = 'bg-red-50 text-red-800 border-red-300';
    } else if (this.color === 'green') {
      baseClass = 'bg-green-50 text-green-800 border-green-300';
    } else if (this.color === 'blue') {
      baseClass = 'bg-blue-50 text-blue-800 border-blue-300';
    } else if (this.color === 'yellow') {
      baseClass = 'bg-yellow-50 text-yellow-800 border-yellow-300';
    } else {
      baseClass = 'bg-red-50 text-red-800 border-red-300';
    }
    return baseClass;
  }

  get iconBorderColor() {
    let borderColor = '';
    if (this.color === 'red') {
      borderColor = 'border-red-800';
    } else if (this.color === 'green') {
      borderColor = 'border-green-800';
    } else if (this.color === 'blue') {
      borderColor = 'border-blue-800';
    } else if (this.color === 'yellow') {
      borderColor = 'border-yellow-800';
    } else {
      borderColor = 'border-red-800';
    }
    return borderColor;
  }
}
