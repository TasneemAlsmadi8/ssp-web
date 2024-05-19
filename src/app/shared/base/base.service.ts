import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environments';
@Injectable({
  providedIn: 'root',
})
export class BaseService {
  baseUrl: string = '';
  httpOptions: { headers: HttpHeaders };

  constructor() {
    this.baseUrl = environment.apiUrl;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        Authorization: 'my-auth-token',
      }),
    };
  }
}
