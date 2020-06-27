import { NgModule } from '@angular/core';
import * as ngCommon from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as containers from './containers';
import * as components from './components';
import * as core from './../../core';

import { StoreModule, MetaReducer } from '@ngrx/store';

import { LazyLoadImageModule } from 'ng-lazyload-image';

import { EffectsModule } from '@ngrx/effects';

import { reducers, effects } from './store';

import { IonicModule } from '@ionic/angular';

import { ExperiencePageRoutingModule } from './experience-routing.module';
import { HttpClientModule } from '@angular/common/http';

import * as guards from './guards';
import { ExperienceComponent } from './containers/experience/experience.component';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule } from '@angular/cdk/overlay';
import { ColorPickerModule } from 'ngx-color-picker';


import { ContentViewerComponent } from './dynamic-content-viewer';
import { TimeFormatPipe } from 'src/app/time.pipe';

export const CONTAINER_COMPONENTS = [
  containers.ActivityMenuAndDragComponent,
  containers.ExperienceComponent,
  containers.UpdateActivityComponent,
  containers.UndoRedoComponent,
  containers.UpdateExperienceComponent,
  containers.UpdateConnectionComponent
];

export const BASIC_COMPONENTS = [
  components.ModuleComponent,
  components.SelectActivityComponent,
  components.ModuleConfigurationComponent,
  components.PreviewExperienceModalComponent,
  components.PreviewActivityComponent,
  components.SliderComponent,
  components.AudioComponent,
  components.DynamicComponent,
  components.MapModalComponent,
  components.MapMediaComponent


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
    MatIconModule,
    OverlayModule,
    DragDropModule,
    ColorPickerModule,
    StoreModule.forFeature('dashboard', reducers),
    EffectsModule.forFeature(effects),
  ],
  declarations: [
    ...CONTAINER_COMPONENTS,
    ...BASIC_COMPONENTS,
    ContentViewerComponent,
    TimeFormatPipe
  ],
  entryComponents: [
    containers.UpdateActivityComponent,
    containers.UpdateConnectionComponent,
    containers.UpdateExperienceComponent,
    components.PreviewExperienceModalComponent,
  ],
  providers: [
    {
      provide: ngCommon.LocationStrategy,
      useClass: ngCommon.HashLocationStrategy,
    },
    ...guards.guards,
  ]
})
export class ExperienceModule { }
