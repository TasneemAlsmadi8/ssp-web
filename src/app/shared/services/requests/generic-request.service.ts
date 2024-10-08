import { Observable } from 'rxjs';
import {
  AddSchema,
  Item,
  ItemType,
  UpdateSchema,
} from '../../interfaces/generic-item';
import { ListRetrievalService } from '../generic.service';
import { User } from '../../interfaces/user';

export interface GenericRequestService<
  T extends Item,
  U extends UpdateSchema,
  A extends AddSchema,
  V extends ItemType
> extends ListRetrievalService<T> {
  list$: Observable<T[]>;

  user: User;

  getAll(): Observable<T[]>;

  cancel(id: string): Observable<any>;

  getTypes(): Observable<V[]>;

  update(body: U, employeeId?: string): Observable<any>;

  add(body: A): Observable<any>;
}
