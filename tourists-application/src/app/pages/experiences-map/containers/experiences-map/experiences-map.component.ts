import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import * as core from './../../../../core';
import { Store, select } from '@ngrx/store';
import * as store from './../../../dashboard/store';
import { LocalStorageService, ToastService } from './../../../../core';
import { take, filter } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import * as L from 'leaflet';
import * as ELG from 'esri-leaflet-geocoder';
import 'leaflet-toolbar/dist/leaflet.toolbar.js';
import 'leaflet-spin/leaflet.spin.js';
import 'leaflet-rotatedmarker';
import 'leaflet-compass/dist/leaflet-compass.src.js';

enum ExperienceState {
  Start,
  Continue,
  Restart,
  FullCompleted,
  PartialCompleted
}

@Component({
  selector: 'app-experiences-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experiences-map.component.html',
  styleUrls: ['./experiences-map.component.scss'],
})
export class ExperiencesMapComponent implements OnInit, OnDestroy {
  experiences: core.ExperienceModel[];
  experiences$: Observable<core.ExperienceModel[]>;
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('mapParent') mapParent: ElementRef;
  subscription = new Subscription();
  subscription2 = new Subscription();
  mapUrl: string;
  inited = false;

  iconFull: any;
  iconPartial: any;
  iconContinue: any;
  iconNew: any;
  iconSelected: any;
  iconUser: any;

  selectedExperience: core.ExperienceModel;

  markers: {};
  userMarker: any;
  location = [];
  // orientation: number;
  curZoom = 15;

  centerMapOnUser: boolean;
  madeSetView: boolean;

  watchId: any;

  private map;

  experienceState: ExperienceState;
  experienceStateLabel: string;

  constructor(
    private st: Store<store.DashboardState>,
    private storage: LocalStorageService,
    private router: Router,
    public cd: ChangeDetectorRef,
    private toastService: ToastService,
    private platform: Platform,
  ) { }

  ngOnInit() {
    this.iconFull = L.icon({
      iconUrl: ('assets/imgs/pin_full.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconPartial = L.icon({
      iconUrl: ('assets/imgs/pin_partial.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconContinue = L.icon({
      iconUrl: ('assets/imgs/pin_continue.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconNew = L.icon({
      iconUrl: ('assets/imgs/pin_new_xp.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconSelected = L.icon({
      iconUrl: ('assets/imgs/pin_selected.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconUser = L.icon({
      iconUrl: ('assets/imgs/pin_user_tri.svg'),
      // shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 20.5]
    });

    this.setCompleted();
    this.st.pipe(select(store.getAllExperiences), take(1)).subscribe(value => this.experiences = value);

    this.startVariables();
    this.createEnterSubscription();

    this.experiences$ = this.st.pipe(select(store.getAllExperiences));
    const sub = this.experiences$.subscribe(experiences => {
      if (experiences.length !== 0) {
        this.experiences = experiences;
        if (this.map == null) {
          this.initMap();

        }
        this.cd.detectChanges();
      }
    });
    this.subscription.add(sub);

    this.startLocation();

  }

  async startLocation() {
    await this.platform.ready();
    this.watchId = navigator.geolocation.watchPosition(this.updateLocation.bind(this), this.updateLocationError.bind(this),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }

  updateLocation(position) {
    const location = [position.coords.latitude, position.coords.longitude];
    if (this.location == null) {
      this.setLocation(location);
    } else if (location[0] !== this.location[0] && location[1] !== this.location[1]) {
      this.setLocation(location);
    }
  }

  updateLocationError(positionError) {
    this.toastService.presentToast(`Error getting user location`, 'danger');
  }

  setLocation(location) {
    if (this.location == null) {
      this.createControls();
      // this.map.setView(location, this.curZoom);
      // this.madeSetView = true;
      this.map.spin(false);
    }

    if (this.centerMapOnUser) {
      this.madeSetView = true;
      this.map.setView(location, this.curZoom);
    }

    if (this.userMarker == null) {
      this.userMarker = L.marker(location, { icon: this.iconUser }).addTo(this.map);
    } else {
      this.userMarker.setLatLng(location);
    }

    /*if (this.orientation != null && !isNaN(this.orientation)) {
      this.userMarker.setRotationAngle(this.orientation);
    }*/

    // this.map.setView(location, 15);
    this.location = location;
    this.map.spin(false);
    this.setActivitiesOnMap();
  }

  async setCompleted() {

    const keys = await this.storage.keys();
    for (const key of keys) {
      if (key === 'favourites' || key.includes('sequence')) {
        continue;
      }
      const allTrue = await this.storage.getExperiencesCompleted(key);
      if (allTrue) {
        const activities = await this.storage.get(key);

        let experience: core.ExperienceModel;
        this.st.pipe(select(store.getExperienceById(key)), take(1)).subscribe(value => experience = value);
        if (experience.activities.length === Object.keys(activities).length) {
          this.st.dispatch(new store.SetExperienceCompleted(true, key));
        }

      }
    }
  }

  createEnterSubscription() {
    this.mapUrl = '/experiences-map';
    this.inited = true;
    const sub2 = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (e.url === this.mapUrl && !this.inited) {
          this.restart();
          // console.log(this.child);
          // this.child.restart();

        }
      });
    this.subscription2.add(sub2);
  }

  startVariables() {
    this.markers = {};
    this.selectedExperience = null;
    this.location = null;
    this.map = null;
    this.centerMapOnUser = true;
    this.madeSetView = false;
    this.userMarker = null;
    this.cd.detectChanges();
  }

  restart() {
    this.startVariables();
    this.mapParent.nativeElement.appendChild(this.mapElement.nativeElement);
    // this.initMap();

    this.subscription = new Subscription();
    this.experiences$ = this.st.pipe(select(store.getAllExperiences));
    const sub = this.experiences$.subscribe(experiences => {
      if (experiences.length !== 0) {
        this.experiences = experiences;
        if (this.map == null) {
          this.initMap();

        }
        this.cd.detectChanges();
      }
    });
    this.subscription.add(sub);

    this.startLocation();
  }

  destroyMap() {
    if (this.map != null) {
      this.map.spin(false);
      this.map.eachLayer((layer) => { this.map.removeLayer(layer); });
      this.map.off();
      this.map.remove();
      this.map = null;

      this.mapParent.nativeElement.removeChild(this.mapElement.nativeElement);
    }

  }


  destroy() {
    this.inited = false;
    this.subscription.unsubscribe();
    this.destroyMap();
    navigator.geolocation.clearWatch(this.watchId);
    // this.child.destroy();
  }

  ngOnDestroy() {
    this.destroy();
    this.subscription2.unsubscribe();
  }

  private initMap(): void {
    this.map = L.map('map', {
      loadingControl: true,
      center: [41.1096614, -8.615795],
      zoom: this.curZoom,
      dragging: true,
      tap: !L.Browser.mobile
    });

    this.map.setMaxBounds([[-90, -180], [90, 180]]);

    this.map.options.inertiaMaxSpeed = 0;
    this.map.options.zoomSnap = 1;
    this.map.options.zoomDelta = 1;
    this.map.options.maxBoundsViscosity = 1;
    if (this.location == null) {
      this.map.spin(true);
    } else {
      this.map.spin(false);
    }

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    tiles.on('tileerror', (error, tile) => {
      this.toastService.presentToast(`Error getting parts of the map`, 'danger');
    });

    tiles.addTo(this.map);

    setTimeout(() => {
      if (this.map != null) {
        this.madeSetView = true;
        this.map.invalidateSize();
        if (this.location != null) {
          this.madeSetView = true;
          this.map.setView(this.location, this.curZoom);
        }
        this.madeSetView = true;
        this.centerMapOnUser = true;
      }
    }, 100);

    const comp = new L.Control.Compass({ autoActive: true, textErr: ' ' });
    comp.on('compass:rotated', (data) => {
      if (this.userMarker != null) {
        this.userMarker.setRotationAngle(360 - data.angle);
      }
      // this.map.setBearing(data.angle);
    });

    this.map.addControl(comp);

    // this.setActivitiesOnMap();
    this.setMapListeners();
  }

  setMapListeners() {
    this.map.on('click', (e) => {
      if (this.selectedExperience != null) {
        this.setMarkerColor(this.selectedExperience);
        this.selectedExperience = null;
        this.cd.detectChanges();
      }

    });

    this.map.on('moveend', (e) => {
      // this.map.invalidateSize();
      if (this.madeSetView) {
        this.madeSetView = false;
        this.centerMapOnUser = true;
      } else {
        this.centerMapOnUser = false;
      }
      // console.log(this.mapHeight);

    });


  }

  createControls() {
    let myAction2;

    const ImmediateSubAction = L.Toolbar2.Action.extend({
      initialize: (map, myAction) => {
        this.map = map;
        myAction2 = myAction;
        L.Toolbar2.Action.prototype.initialize.call(this);
      },
      addHooks: () => {
        // myAction2.disable();
      }
    });

    const centerOnMyLocation = ImmediateSubAction.extend({
      options: {
        toolbarIcon: {
          html: '<ion-icon name="location-sharp" class="centerIcon"></ion-icon>',
          tooltip: 'Centre on my location'
        },
      },
      addHooks: () => {
        this.madeSetView = true;
        this.map.setView(this.location, this.curZoom);
        ImmediateSubAction.prototype.addHooks.call(this);
      }
    });
    new L.Toolbar2.Control({
      position: 'topleft',
      actions: [centerOnMyLocation]
    }).addTo(this.map);

    const searchControl = ELG.geosearch({
      position: 'topright',
      useMapBounds: false
    }).addTo(this.map);

    const results = L.layerGroup().addTo(this.map);

    searchControl.on('results', (data) => {
      results.clearLayers();
      for (let i = data.results.length - 1; i >= 0; i--) {
        this.madeSetView = true;
        this.map.setView(data.results[i].latlng, this.curZoom);
      }
    });
  }

  setActivitiesOnMap() {
    for (const experience of this.experiences) {

      if (this.markers[experience.id] == null) {
        const marker = L.marker([experience.location.lat, experience.location.lng], { icon: this.iconNew }).addTo(this.map);
        marker.on('click', async (e) => {
          if (this.selectedExperience != null) {
            this.setMarkerColor(this.selectedExperience);
          }
          this.selectedExperience = experience;

          const state = await this.checkExperienceState(experience);
          switch (state) {
            case ExperienceState.Continue:
              this.experienceState = ExperienceState.Continue;
              this.experienceStateLabel = 'Continue';
              break;
            case ExperienceState.Start:
              this.experienceState = ExperienceState.Start;
              this.experienceStateLabel = 'Start';
              break;
            case ExperienceState.FullCompleted:
            case ExperienceState.PartialCompleted:
              this.experienceState = ExperienceState.Restart;
              this.experienceStateLabel = 'Restart';
              break;
          }

          marker.setIcon(this.iconSelected);
          this.cd.detectChanges();
        });
        this.markers[experience.id] = marker;
      }

      if (this.selectedExperience != null && this.selectedExperience.id === experience.id) {
        this.markers[experience.id].setIcon(this.iconSelected);
      } else {
        this.setMarkerColor(experience);
      }

    }
  }

  async setMarkerColor(experience) {
    const state = await this.checkExperienceState(experience);

    switch (state) {
      case ExperienceState.Start:
        this.markers[experience.id].setIcon(this.iconNew);
        break;
      case ExperienceState.Continue:
        this.markers[experience.id].setIcon(this.iconContinue);
        break;
      case ExperienceState.PartialCompleted:
        this.markers[experience.id].setIcon(this.iconPartial);
        break;
      case ExperienceState.FullCompleted:
        this.markers[experience.id].setIcon(this.iconFull);
        break;
    }
  }

  async checkExperienceState(experience: core.ExperienceModel) {

    const activities = await this.storage.get(experience.id);
    if (activities != null && Object.keys(activities).length !== 0) {
      if (experience.completed) {
        if (Object.keys(activities).length === experience.activities.length) {
          return ExperienceState.FullCompleted;
        } else {
          return ExperienceState.PartialCompleted;
        }
      } else {
        return ExperienceState.Continue;
      }
    } else {
      return ExperienceState.Start;
    }
  }

}
