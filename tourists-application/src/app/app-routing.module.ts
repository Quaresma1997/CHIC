import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'experiences',
    loadChildren: () => import('./pages/experience/experience.module').then(m => m.ExperienceModule)
  },
  {
    path: 'favourites',
    loadChildren: () => import('./pages/favourites/favourites.module').then(m => m.FavouritesModule)
  },
  {
    path: 'experiences-map',
    loadChildren: () => import('./pages/experiences-map/experiences-map.module').then(m => m.ExperiencesMapModule)
  },
  {
    path: 'filter',
    loadChildren: () => import('./pages/filter/filter.module').then(m => m.FilterModule)
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
