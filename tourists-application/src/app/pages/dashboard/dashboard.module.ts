import { NgModule } from '@angular/core';
import * as ngCommon from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as containers from './containers';
import * as components from './components';

import { IonicModule } from '@ionic/angular';

import { StoreModule, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { reducers, effects } from './store';
import * as guards from './guards';
import * as core from './../../core';

import { LazyLoadImageModule } from 'ng-lazyload-image';

import { HttpClientModule } from '@angular/common/http';

export const CONTAINER_COMPONENTS = [
  containers.DashboardComponent,
  containers.ExperienceListComponent,
];

export const BASIC_COMPONENTS = [
  components.ExperienceItemComponent,
  components.DashboardToolbarComponent
];


@NgModule({
  imports: [
    ngCommon.CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LazyLoadImageModule,
    DashboardPageRoutingModule,
    HttpClientModule,
    StoreModule.forFeature('dashboard', reducers),
    EffectsModule.forFeature(effects),
  ],
  declarations: [
    ...CONTAINER_COMPONENTS,
    ...BASIC_COMPONENTS,
  ],
  providers: [
    {
      provide: ngCommon.LocationStrategy,
      useClass: ngCommon.HashLocationStrategy
    },
    ...guards.guards
  ]
})
export class DashboardModule {}
