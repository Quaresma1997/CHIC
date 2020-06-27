import { NgModule } from '@angular/core';
import * as ngCommon from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as containers from './containers';
import * as components from './components';

import { IonicModule } from '@ionic/angular';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { FilterPageRoutingModule } from './filter-routing.module';
import { HttpClientModule } from '@angular/common/http';

import * as guards from './guards';

import { reducers, effects } from '../dashboard/store';


import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';


import { LazyLoadImageModule } from 'ng-lazyload-image';

export const CONTAINER_COMPONENTS = [
  containers.FilterComponent,
];

export const BASIC_COMPONENTS = [
  components.DashboardToolbarComponent
];


@NgModule({
  imports: [
    ngCommon.CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LazyLoadImageModule,
    IonicModule,
    FilterPageRoutingModule,
    HttpClientModule,
    MatExpansionModule,
    MatTabsModule,
    MatSelectModule,
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
      useClass: ngCommon.HashLocationStrategy,
    },
    ...guards.guards
  ]
})
export class FilterModule { }
