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

import * as core from './core';
import { TooltipsModule } from 'ionic4-tooltips';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';

import { reducers, CustomSerializer, effects } from './store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AngularFireModule } from '@angular/fire';
// import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { StoreRouterConnectingModule, RouterStateSerializer } from '@ngrx/router-store';
import { NoCacheHeadersInterceptor } from './core/nocacheheaders.interceptor';
import { MenuComponent } from './menu/menu.component';
import { TimeFormatPipe } from './time.pipe';
import { LazyLoadImageModule } from 'ng-lazyload-image';
// import { AngularFireAuthModule } from '@angular/fire/auth';

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

export const storeDevTools: ModuleWithProviders[] =
  !environment.production ? [StoreDevtoolsModule.instrument()] : [];

@NgModule({
  declarations: [AppComponent, MenuComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    LazyLoadImageModule,
    IonicModule.forRoot(),
    core.CoreModule.forRoot(),
    TooltipsModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot(effects),
    storeDevTools,
    StoreRouterConnectingModule.forRoot(),
    AngularFireModule.initializeApp(config),
    AngularFireStorageModule, // storage

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
