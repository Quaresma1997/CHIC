import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as guards from './guards';
import * as containers from './containers';

const routes: Routes = [
  {
    path: ':id',
    canActivate: [guards.SyncGuardHelper],
    data: {
      syncGuards: [
        guards.ExperienceExistsGuard,
        guards.ModuleGuard,
      ]
    },
    component: containers.ExperienceComponent,
    canDeactivate: [guards.ConfirmDeactivateGuard]

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
export class ExperiencePageRoutingModule { }
