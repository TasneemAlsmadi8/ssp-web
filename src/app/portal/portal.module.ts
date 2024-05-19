import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { RouterOutlet } from '@angular/router';
import { PortalRoutingModule } from './portal-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../shared/shared/shared.module';
import { SideBarContentComponent } from './layout/side-bar-content/side-bar-content.component';
import { DropDownLinksComponent } from './layout/side-bar-content/drop-down-links/drop-down-links.component';

@NgModule({
  declarations: [
    LayoutComponent,
    SideBarContentComponent,
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    PortalRoutingModule,
    FontAwesomeModule,
    HttpClientModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    DropDownLinksComponent,
  ],
})
export class PortalModule {}
