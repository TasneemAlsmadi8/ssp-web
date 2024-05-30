import { Observable } from 'rxjs';

export interface ListRetrievalService<T> {
  list$: Observable<T[]>;
  getAll(): Observable<T[]>;
}
