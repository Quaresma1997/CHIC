import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import * as L from 'leaflet';
import * as ELG from 'esri-leaflet-geocoder';
import 'leaflet-toolbar/dist/leaflet.toolbar.js';
import 'leaflet-spin/leaflet.spin.js';
import 'leaflet-compass/dist/leaflet-compass.min.js';
import 'leaflet-rotatedmarker';

// import 'src/assets/js';

import { Observable, Subscription, from } from 'rxjs';
import * as core from './../../../../core';
import * as store from './../../../dashboard/store';
import { Store, select } from '@ngrx/store';
import { take, filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { ToastService } from './../../../../core';


@Component({
  selector: 'app-experience-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience-map.component.html',
  styleUrls: ['./experience-map.component.scss'],
})
export class ExperienceMapComponent implements OnInit, OnDestroy {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('mapParent') mapParent: ElementRef;
  activities$: Observable<core.ActivityModel[]>;
  activitiesSequence$: Observable<core.ActivityModel[]>;
  activities: core.ActivityModel[];
  subscription = new Subscription();
  subscription2 = new Subscription();
  mapUrl: string;
  inited = false;

  activitiesCompleted$: Observable<core.ActivityModel[]>;
  allActivities$: Observable<core.ActivityModel[]>;

  iconCompleted: any;
  iconBlocked: any;
  iconAvailable: any;
  iconSelected: any;
  iconSplit: any;
  iconUser: any;

  experienceId: string;

  selectedActivity: core.ActivityModel;

  markers: {};

  userMarker: any;

  location = {};

  curZoom = 15;

  private map;

  centerMapOnUser: boolean;
  madeSetView: boolean;

  constructor(
    private st: Store<store.DashboardState>,
    private router: Router,
    public cd: ChangeDetectorRef,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.iconCompleted = L.icon({
      iconUrl: ('assets/imgs/pin_completed.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconAvailable = L.icon({
      iconUrl: ('assets/imgs/pin_activity.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconBlocked = L.icon({
      iconUrl: ('assets/imgs/pin_blocked.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconSelected = L.icon({
      iconUrl: ('assets/imgs/pin_selected.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconSplit = L.icon({
      iconUrl: ('assets/imgs/pin_split.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconUser = L.icon({
      iconUrl: ('assets/imgs/pin_user_tri.svg'),
      // shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 20.5]
    });

    this.startVariables();
    this.createEnterSubscription();

    this.activitiesCompleted$ = this.st.pipe(select(store.getAvailableActivitiesCompleted()));
    this.allActivities$ = this.st.pipe(select(store.getAllActivities));
    this.activities$ = this.st.pipe(select(store.getAllAvailableActivities));
    this.activitiesSequence$ = this.st.pipe(select(store.getActivitiesSequence));
    const sub = this.activities$.subscribe(activities => {
      if (activities.length !== 0) {
        this.activities = activities;
        if (this.map == null) {
          this.initMap();

        }
        this.cd.detectChanges();
      }
    });
    this.subscription.add(sub);



    this.setLocationSubscription();

  }

  setLocationSubscription() {
    const sub2 = this.st.pipe(select(store.getExperienceLocation)).subscribe(location => {
      if (location != null && this.map != null) {
        // console.log(location);
        if (this.location == null) {
          this.madeSetView = true;
          this.map.setView(location, this.curZoom);
          this.createControls();
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

        this.location = location;
        this.map.spin(false);
        this.setActivitiesOnMap();
      }

    });
    this.subscription.add(sub2);
  }

  createEnterSubscription() {
    this.st.pipe(select(store.getSelectedExperienceId), take(1)).subscribe(value => this.experienceId = value);
    this.mapUrl = '/experiences/' + this.experienceId + '/map';
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
    this.selectedActivity = null;
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
    this.initMap();

    this.subscription = new Subscription();
    const sub = this.activities$.subscribe(activities => {
      this.activities = activities;
      this.cd.detectChanges();
    });
    this.subscription.add(sub);

    this.setLocationSubscription();
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

    setTimeout(() => { if (this.map != null) { this.map.invalidateSize(); this.madeSetView = true; this.centerMapOnUser = true; } }, 100);

    const sub = this.activitiesSequence$.subscribe(activities => {
      let activitiesSequence;
      this.st.pipe(select(store.getActivitiesSequence), take(1)).subscribe(value => activitiesSequence = value);
      this.setSequenceLines(activitiesSequence);
    });
    this.subscription.add(sub);

    const comp = new L.Control.Compass({ autoActive: true, textErr: ' ' });
    comp.on('compass:rotated', (data) => {
      // console.log(data);
      // console.log('ANGLE: ' + data.angle);
      // console.log(this.userMarker);
      if (this.userMarker != null) {
        this.userMarker.setRotationAngle(360 - data.angle);
      }
      // this.map.setBearing(data.angle);
    });

    this.map.addControl(comp);

    // this.setActivitiesOnMap();
    this.setMapListeners();
  }

  setSequenceLines(activities: core.ActivityModel[]) {
    /* Show lines */
    const line = activities.map(activity => [activity.lat, activity.lng]);
    L.polyline(line, { color: '#5E4068' }).addTo(this.map);
  }

  setMapListeners() {
    this.map.on('click', (e) => {
      if (this.selectedActivity != null) {
        this.setMarkerColor(this.selectedActivity);
        this.selectedActivity = null;
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
    // const line = this.activities.map(point => [point.lat, point.lng]);
    // L.polyline(line, { color: '#178a00' }).addTo(this.map);
    this.activities.forEach(activity => {

      if (this.markers[activity.id] == null) {
        const marker = L.marker([activity.lat, activity.lng], { icon: this.iconBlocked }).addTo(this.map);
        marker.on('click', (e) => {
          if (this.selectedActivity != null) {
            this.setMarkerColor(this.selectedActivity);
          }
          this.selectedActivity = activity;

          marker.setIcon(this.iconSelected);
          this.cd.detectChanges();
        });
        this.markers[activity.id] = marker;
      }

      if (this.selectedActivity != null && this.selectedActivity.id === activity.id) {
        this.markers[activity.id].setIcon(this.iconSelected);
      } else {
        this.setMarkerColor(activity);
      }

    });
  }

  setMarkerColor(activity) {
    if (activity.completed) {
      this.markers[activity.id].setIcon(this.iconCompleted);
    } else if (this.hasSiblings(activity)) {
      this.markers[activity.id].setIcon(this.iconSplit);
    } else if (activity.blocked) {
      this.markers[activity.id].setIcon(this.iconBlocked);
    } else {
      this.markers[activity.id].setIcon(this.iconAvailable);
    }
  }
  hasSiblings(activity) {
    let parentsCompleted;
    this.st.pipe(select(store.getActivitiesFromActivityAsTarget(activity.id)), take(1)).subscribe(value => parentsCompleted = value);
    if (parentsCompleted.length === 0) {
      // console.log('NO PARENTS');
      return false;
    }

    for (const parent of parentsCompleted) {
      let children: core.ActivityModel[];
      this.st.pipe(select(store.getActivitiesFromActivityAsSource(parent.id)),
        take(1)).subscribe(value => children = value);
      if (children.length > 1) {
        return true;
      }
    }
  }
}
