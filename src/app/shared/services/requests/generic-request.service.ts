import { Observable } from 'rxjs';
import {
  AddSchema,
  Item,
  ItemType,
  UpdateSchema,
} from '../../interfaces/requests/generic-request';
import { Injectable } from '@angular/core';

@Injectable({})
export interface GenericRequestService<
  T extends Item,
  U extends UpdateSchema,
  A extends AddSchema,
  V extends ItemType
> {
  items$: Observable<T[]>;

  user: any; // Define the return type of userService.getUser()

  getAll(): Observable<T[]>;

  cancel(id: string): Observable<any>;

  getTypes(): Observable<V[]>;

  update(body: U): Observable<any>;

  add(body: A): Observable<any>;
}
