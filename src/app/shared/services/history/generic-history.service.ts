import { Observable } from 'rxjs';
import { ListRetrievalService } from '../generic.service';
import { User } from '../../interfaces/user';

export interface GenericHistoryService<T> extends ListRetrievalService<T> {
  list$: Observable<T[]>;
  user: User;

  getAll(): Observable<T[]>;
}
