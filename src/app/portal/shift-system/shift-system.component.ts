import { Component, OnInit } from '@angular/core';
import {
  CalendarEvent,
  CalendarModule,
  CalendarView,
  DAYS_OF_WEEK,
} from 'angular-calendar';
import { WeekDay } from 'calendar-utils/calendar-utils';
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
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
import { stringToColor } from 'src/app/shared/utils/color-utils';
import { enUS } from 'date-fns/locale';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  selector: 'app-shift-system',
  imports: [
    CalendarModule,
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    ModalComponent,
    TranslateModule,
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
    if (getMonth(value) !== getMonth(this.viewDate)) {
      this._viewDate = value;
      this.updateMonthShifts();
      this.closeOpenMonthViewDay();
    }
    this._viewDate = value;
  }

  weekStartsOn: number = DAYS_OF_WEEK.SUNDAY;

  weekendDays: number[] = [DAYS_OF_WEEK.FRIDAY, DAYS_OF_WEEK.SATURDAY];

  get currentLocale() {
    return this.languageService.selectedLanguage;
  }

  constructor(
    private shiftService: ShiftSystemService,
    private languageService: LanguageService
  ) {
    super();
    this.viewControl = new FormControl(this.view);
    this.viewControl.valueChanges.subscribe((view) => this.setView(view));
    shiftService.list$.subscribe((value) => {
      this.events = value.map(this.mapEmployeeShiftToCalendarEvent);
    });
  }

  private mapEmployeeShiftToCalendarEvent(
    shift: EmployeeShift
  ): CalendarEvent<EmployeeShift> {
    const title = shift.shiftType
      ? `${shift.employeeName} - ${shift.shiftType}`
      : shift.employeeName;
    return {
      ...shift,
      start: new Date(shift.date),
      title: title,
      allDay: true,
      color: {
        primary: stringToColor(title),
        secondary: stringToColor(title, {
          saturation: 50,
          lightness: 90,
        }),
      },
    };
  }

  ngOnInit(): void {
    this.updateMonthShifts();
  }

  updateMonthShifts() {
    const monthName = format(this.viewDate, 'MMMM', { locale: enUS });

    this.shiftService
      .getAll(this.viewDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log(`Successfully fetched data for month ${monthName}`);
        },
        error: (error: HttpErrorResponse) => {
          console.error(
            `Failed to fetch data for month ${monthName}:`,
            error.error || error
          );
        },
      });

    if (this.isNextMonthVisible()) {
      const monthName = format(addMonths(this.viewDate, 1), 'MMMM', {
        locale: enUS,
      });
      this.shiftService
        .getAll(addMonths(this.viewDate, 1))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Successfully fetched data for month ${monthName}`);
          },
          error: (error: HttpErrorResponse) => {
            console.error(
              `Failed to fetch data for month ${monthName}:`,
              error.error || error
            );
          },
        });
    }
    if (this.isPrevMonthVisible()) {
      const monthName = format(addMonths(this.viewDate, -1), 'MMMM', {
        locale: enUS,
      });
      this.shiftService
        .getAll(addMonths(this.viewDate, -1))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Successfully fetched data for month ${monthName}`);
          },
          error: (error: HttpErrorResponse) => {
            console.error(
              `Failed to fetch data for month ${monthName}:`,
              error.error || error
            );
          },
        });
    }
  }

  monthDayClicked({
    date,
    events,
  }: {
    date: Date;
    events: CalendarEvent[];
  }): void {
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

  weekDayClicked(weekDay: WeekDay) {
    this.viewDate = weekDay.date;
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

  isPrevMonthVisible() {
    if (this.view === CalendarView.Month) {
      return (
        getMonth(startOfWeek(startOfMonth(this.viewDate))) !==
        getMonth(this.viewDate)
      );
    }
    if (this.view === CalendarView.Week) {
      return getMonth(startOfWeek(this.viewDate)) !== getMonth(this.viewDate);
    }
    return false;
  }

  isNextMonthVisible() {
    if (this.view === CalendarView.Month) {
      return (
        getMonth(endOfWeek(endOfMonth(this.viewDate))) !==
        getMonth(this.viewDate)
      );
    }
    if (this.view === CalendarView.Week) {
      return getMonth(endOfWeek(this.viewDate)) !== getMonth(this.viewDate);
    }
    return false;
  }
}
