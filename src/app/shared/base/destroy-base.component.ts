import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-destroy-base',
  standalone: true,
  imports: [],
  template: '',
})
export class DestroyBaseComponent implements OnDestroy {
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
