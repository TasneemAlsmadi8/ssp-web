import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ConfigService } from '../services/config.service';
@Injectable({
  providedIn: 'root',
})
export class BaseService {
  protected baseUrl: string = '';
  protected httpOptions: { headers: HttpHeaders };

  constructor() {
    const configService = inject(ConfigService);
    this.baseUrl = configService.getConfig().apiUrl;
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
