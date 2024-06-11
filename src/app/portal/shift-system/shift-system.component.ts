import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarModule, CalendarView } from 'angular-calendar';
import { getMonth, isSameDay, isSameMonth } from 'date-fns';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ShiftSystemService } from 'src/app/shared/services/shift-system.service';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';
import { EmployeeShift } from 'src/app/shared/interfaces/shift-system';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-shift-system',
  imports: [
    CalendarModule,
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './shift-system.component.html',
  styleUrls: ['./shift-system.component.scss'],
})
export class ShiftSystemComponent
  extends DestroyBaseComponent
  implements OnInit
{
  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  private _viewDate: Date = new Date();
  public get viewDate(): Date {
    return this._viewDate;
  }
  public set viewDate(value: Date) {
    if (getMonth(value) !== getMonth(this._viewDate))
      this.updateMonthShifts(value);
    this._viewDate = value;
  }

  refresh = new Subject<void>();
  viewControl: FormControl;

  events: CalendarEvent<EmployeeShift>[] = [];
  activeDayIsOpen: boolean = false;

  faArrowLeft = faAngleLeft; // Define icons
  faArrowRight = faAngleRight;

  constructor(private shiftService: ShiftSystemService) {
    super();
    this.viewControl = new FormControl(this.view);
    this.viewControl.valueChanges.subscribe((view) => this.setView(view));
    shiftService.list$.subscribe((value) => {
      this.events = value.map((shift): CalendarEvent<EmployeeShift> => {
        return {
          ...shift,
          start: new Date(shift.date),
          title: shift.shiftType || 'empty shift type',
          allDay: true,
        };
      });
    });
  }

  ngOnInit(): void {
    this.updateMonthShifts(this.viewDate);
  }

  updateMonthShifts(date: Date) {
    this.shiftService
      .getAll(date)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err: HttpErrorResponse) => {
          // if (
          //   err.error ===
          //   'There are no shifts defined for that employee in that month'
          // ) {
          // } else
          console.log('Error: ' + err.error);
        },
      });
    this.closeOpenMonthViewDay();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    // this.modalData = { event, action };
    console.log({ action, event });
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  setView(view: CalendarView) {
    this.view = view;
    this.activeDayIsOpen = false;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}
