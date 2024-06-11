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
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';

@Component({
  selector: 'app-shift-system',
  imports: [
    CalendarModule,
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    ModalComponent,
  ],
  standalone: true,
  templateUrl: './shift-system.component.html',
  styleUrls: ['./shift-system.component.scss'],
})
export class ShiftSystemComponent
  extends DestroyBaseComponent
  implements OnInit
{
  faArrowLeft = faAngleLeft;
  faArrowRight = faAngleRight;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  refresh = new Subject<void>();
  viewControl: FormControl;

  events: CalendarEvent<EmployeeShift>[] = [];
  activeDayIsOpen: boolean = false;

  eventDetailsIsOpen = false;
  activeEventDetails?: EmployeeShift;

  private _viewDate: Date = new Date();

  get viewDate(): Date {
    return this._viewDate;
  }
  set viewDate(value: Date) {
    if (getMonth(value) !== getMonth(this._viewDate))
      this.updateMonthShifts(value);
    this._viewDate = value;
  }

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

  viewDetails(event: CalendarEvent): void {
    this.eventDetailsIsOpen = true;
    this.activeEventDetails = event as unknown as EmployeeShift;
  }

  setView(view: CalendarView) {
    this.view = view;
    this.activeDayIsOpen = false;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}
