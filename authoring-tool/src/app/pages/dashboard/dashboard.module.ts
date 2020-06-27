import { NgModule } from '@angular/core';
import * as ngCommon from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as containers from './containers';
import * as components from './components';

import { IonicModule } from '@ionic/angular';

import { LazyLoadImageModule } from 'ng-lazyload-image';

import { StoreModule, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { reducers, effects } from '../experience/store';
import * as guards from './guards';


import { HttpClientModule } from '@angular/common/http';
import { ExperienceAddFormComponent } from './components/experience-add-form/experience-add-form.component';

export const CONTAINER_COMPONENTS = [
  containers.DashboardComponent,
  containers.ExperienceListComponent,
];

export const BASIC_COMPONENTS = [
  components.ExperienceItemComponent,
  components.ExperienceAddComponent,
  components.DashboardToolbarComponent,
  components.ExperienceAddFormComponent
];


@NgModule({
  imports: [
    ngCommon.CommonModule,
    FormsModule,
    LazyLoadImageModule,
    ReactiveFormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    HttpClientModule,
    StoreModule.forFeature('dashboard', reducers),
    EffectsModule.forFeature(effects),
  ],
  declarations: [
    ...CONTAINER_COMPONENTS,
    ...BASIC_COMPONENTS,
  ],
  entryComponents: [ExperienceAddFormComponent],
  providers: [
    {
      provide: ngCommon.LocationStrategy,
      useClass: ngCommon.HashLocationStrategy
    },
    ...guards.guards
  ]
})
export class DashboardModule {}
