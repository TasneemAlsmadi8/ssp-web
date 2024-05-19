import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { authGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'portal',
  },
  {
    path: 'portal',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../app/portal/portal.module').then((m) => m.PortalModule),
  },
  {
    title: 'Login',
    path: 'login',
    loadComponent: () =>
      import('../app/login/login.component').then((m) => m.LoginComponent),
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
