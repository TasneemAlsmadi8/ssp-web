import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayPaginator } from '../../utils/array-paginator';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-paginated-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './paginated-table.component.html',
  styleUrls: ['./paginated-table.component.scss'],
})
export class PaginatedTableComponent implements OnInit {
  @Input({ required: true }) set items(value: any[]) {
    this.paginator.updateItems(value);
  }
  @Input() pageSize: number = 10;
  @Output() pageChange = new EventEmitter<any[]>();

  get items(): any[] {
    return this.paginator.page;
  }
  paginator: ArrayPaginator;

  constructor() {
    this.paginator = new ArrayPaginator([]);
    this.paginator.setPageChangeCallback(() => {
      this.pageChange.emit(this.paginator.page);
    });
  }
  ngOnInit(): void {
    this.paginator.setPageSize(this.pageSize);
  }
}
