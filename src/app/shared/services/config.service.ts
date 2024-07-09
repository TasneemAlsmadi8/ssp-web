import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Config } from '../interfaces/config';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config?: Config;

  constructor(private http: HttpClient) {}

  loadConfig(): Observable<Config> {
    return this.http
      .get<Config>('/assets/config.json')
      .pipe(tap((config) => (this.config = config)));
  }

  getConfig(): Config {
    if (!this.config)
      throw new Error(
        'Configuration did not load yet.'
      );

    return this.config;
  }
}
