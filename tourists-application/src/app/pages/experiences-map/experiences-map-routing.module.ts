import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as guards from './guards';
import * as containers from './containers';

const routes: Routes = [
  {
    path: '',
    canActivate: [guards.ExperienceGuard],
    canDeactivate: [guards.ExperienceGuard],
    component: containers.ExperiencesMapComponent,
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExperiencesMapPageRoutingModule { }
