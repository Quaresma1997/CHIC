import { NgModule } from '@angular/core';
import * as ngCommon from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as containers from './containers';
import * as components from './components';

import { IonicModule } from '@ionic/angular';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { ExperiencePageRoutingModule } from './experience-routing.module';
import { HttpClientModule } from '@angular/common/http';

import * as guards from './guards';

import { reducers, effects } from '../dashboard/store';


import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';

import { ContentViewerComponent } from './dynamic-content-viewer';
import { TimeFormatPipe } from 'src/app/time.pipe';

import { LazyLoadImageModule } from 'ng-lazyload-image';

export const CONTAINER_COMPONENTS = [
  containers.ExperienceComponent
];

export const BASIC_COMPONENTS = [
  components.ActivityComponent,
  components.ActivityItemComponent,
  components.AudioComponent,
  components.ExperienceIntroComponent,
  components.ExperienceListComponent,
  components.ExperienceMapComponent,
  components.ExperienceRadarComponent,
  components.ExperienceToolbarComponent,
  components.SliderComponent,
  components.MapActivityComponent,
  components.DynamicComponent,
  components.MapMediaComponent,
  components.ImageModalComponent,
  components.CompletedModalComponent

];


@NgModule({
  imports: [
    ngCommon.CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LazyLoadImageModule,
    IonicModule,
    ExperiencePageRoutingModule,
    HttpClientModule,
    MatTooltipModule,
    MatExpansionModule,
    MatTabsModule,
    MatSelectModule,
    StoreModule.forFeature('dashboard', reducers),
    EffectsModule.forFeature(effects),
  ],
  declarations: [
    ...CONTAINER_COMPONENTS,
    ...BASIC_COMPONENTS,
    ContentViewerComponent,
    TimeFormatPipe
  ],
  providers: [
    {
      provide: ngCommon.LocationStrategy,
      useClass: ngCommon.HashLocationStrategy,
    },
    ...guards.guards
  ]
})
export class ExperienceModule { }
