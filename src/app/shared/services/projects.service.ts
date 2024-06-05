import { Injectable } from '@angular/core';
import { BaseService } from '../base/base.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Project, ProjectApi } from '../interfaces/project';
import { SharedArrayStore } from '../utils/shared-array-store';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService extends BaseService {
  private endpoint = '/Project/GetProjectCodes';
  private url = this.baseUrl + this.endpoint;

  private projectStore = new SharedArrayStore<Project>();
  constructor(private http: HttpClient) {
    super();
  }

  getProjects(): Observable<Project[]> {
    if (this.projectStore.isEmpty()) {
      this.http
        .get<ProjectApi[]>(this.url, this.httpOptions)
        .pipe(map((response) => response.map(ProjectAdapter.apiToModel)))
        .subscribe((projects) => {
          this.projectStore.update(projects);
        });
    }
    return this.projectStore.observable$;
  }

  getProjectName(code: string): string {
    const project = this.projectStore.find((value) => value.code === code);
    if (!project) throw new Error('Invalid project code');
    return project?.name;
  }
}

class ProjectAdapter {
  static apiToModel(apiSchema: ProjectApi): Project {
    const obj: Project = {
      code: apiSchema.prjCode,
      name: apiSchema.prjName,
    };
    return obj;
  }
}
