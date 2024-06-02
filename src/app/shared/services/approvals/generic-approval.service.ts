import { Observable } from 'rxjs';
import { ListRetrievalService } from '../generic.service';
import { User } from '../../interfaces/user';

export interface GenericApprovalService<T> extends ListRetrievalService<T> {
  list$: Observable<T[]>;

  user: User;

  getAll(): Observable<T[]>;
  approve(id: string): Observable<boolean>;
  reject(id: string): Observable<boolean>;
}
