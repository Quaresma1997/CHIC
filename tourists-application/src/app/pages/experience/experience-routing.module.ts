import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as guards from './guards';
import * as containers from './containers';
import * as components from './components';

const routes: Routes = [
  {
    path: ':id',
    canActivate: [guards.SyncGuardHelper],
    data: {
      syncGuards: [
        guards.ExperienceExistsGuard,
        guards.ModuleGuard,
        /*guards.ActivityGuard,
        guards.ConnectionGuard,*/
      ]
    },
    component: containers.ExperienceComponent,
    children: [
      {
        path: 'about',
        component: components.ExperienceIntroComponent,
      },
      {
        path: 'list',
        component: components.ExperienceListComponent,
        canDeactivate: [guards.ActivityGuard],
      },
      {
        path: 'map',
        component: components.ExperienceMapComponent,
        canDeactivate: [guards.ActivityGuard],
      },
      {
        path: 'radar',
        component: components.ExperienceRadarComponent,
        canDeactivate: [guards.ActivityGuard],
      },
      {
        path: ':id',
        component: components.ActivityComponent,
        canDeactivate: [guards.ActivityGuard],
      },
      {
        path: '',
        redirectTo: 'about',
        pathMatch: 'full'
      }
    ]

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
