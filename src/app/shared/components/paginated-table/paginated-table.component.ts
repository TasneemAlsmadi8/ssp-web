import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayPaginator } from '../../utils/array-paginator';

@Component({
  selector: 'app-paginated-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginated-table.component.html',
  styleUrls: ['./paginated-table.component.scss'],
})
export class PaginatedTableComponent<T> {
  @Input({ required: true }) rowArray: T[] = [];
  paginator = new ArrayPaginator([]);
}
