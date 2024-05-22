import { Injectable } from '@angular/core';
import { BaseService } from '../base/base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../interfaces/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService extends BaseService {
  private endpoint = '/Project/GetProjectCodes';
  private url = this.baseUrl + this.endpoint;

  constructor(private http: HttpClient) {
    super();
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.url, this.httpOptions);
  }
}
