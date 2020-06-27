import { NgModule, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TooltipsModule } from 'ionic4-tooltips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
// import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
// import { AngularFireAuthModule } from '@angular/fire/auth';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import * as core from './core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule, MetaReducer } from '@ngrx/store';
import {
  StoreRouterConnectingModule,
  RouterStateSerializer
} from '@ngrx/router-store';
import { storeFreeze } from 'ngrx-store-freeze';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { AppState, reducers, CustomSerializer, effects } from './store';
import { InMemoryDataService } from './core';
import { NoCacheHeadersInterceptor } from './core/nocacheheaders.interceptor';

const config = {
  apiKey: 'AIzaSyDMo-tvEs4Vd3cV7Kzp2JlnUYkSXS2byLU',
  authDomain: 'chic-15ea3.firebaseapp.com',
  databaseURL: 'https://chic-15ea3.firebaseio.com',
  projectId: 'chic-15ea3',
  storageBucket: 'chic-15ea3.appspot.com',
  messagingSenderId: '83666951684',
  appId: '1:83666951684:web:daf9a378d44992d441df51',
  measurementId: 'G-18RZY2L5LN'
};


export const metaReducers: MetaReducer<any>[] =
  !environment.production ? [storeFreeze] : [];

export const storeDevTools: ModuleWithProviders[] =
  !environment.production ? [StoreDevtoolsModule.instrument()] : [];


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    LazyLoadImageModule,
    IonicModule.forRoot(),
    core.CoreModule.forRoot(),
    TooltipsModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    // HttpClientInMemoryWebApiModule.forRoot(
    //   InMemoryDataService, { dataEncapsulation: false }
    // ),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot(effects),
    storeDevTools,
    StoreRouterConnectingModule.forRoot(),
    AngularFireModule.initializeApp(config),
    AngularFireStorageModule // storage

  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: RouterStateSerializer,
      useClass: CustomSerializer
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoCacheHeadersInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
