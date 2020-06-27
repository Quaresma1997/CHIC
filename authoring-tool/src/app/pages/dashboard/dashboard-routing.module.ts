import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as guards from './guards';
import * as containers from './containers';

const routes: Routes = [
  {
    path: '',
    canActivate: [guards.ExperienceGuard],
    component: containers.DashboardComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule { }
