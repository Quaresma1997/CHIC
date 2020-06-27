import {
  Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef,
  ChangeDetectorRef, OnDestroy, AfterViewInit
} from '@angular/core';
import * as L from 'leaflet';
import * as ELG from 'esri-leaflet-geocoder';
import 'leaflet-toolbar/dist/leaflet.toolbar.js';
import 'leaflet-spin/leaflet.spin.js';
import 'leaflet-compass/dist/leaflet-compass.min.js';

import { Observable, Subscription, from, fromEvent } from 'rxjs';
import * as core from './../../../../core';
import * as store from './../../../dashboard/store';
import { Store, select } from '@ngrx/store';
import { take, filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-experience-radar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience-radar.component.html',
  styleUrls: ['./experience-radar.component.scss'],
})
export class ExperienceRadarComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('mapParent') mapParent: ElementRef;
  @ViewChild('mapContainer') mapContainer: ElementRef;
  @ViewChild('indicator') indicator: any;
  activities$: Observable<core.ActivityModel[]>;
  activitiesSequence$: Observable<core.ActivityModel[]>;
  activities: core.ActivityModel[];
  activitiesCompleted$: Observable<core.ActivityModel[]>;
  allActivities$: Observable<core.ActivityModel[]>;
  subscription2 = new Subscription();
  mapUrl: string;
  inited = false;
  curZoom = 15;

  subscription = new Subscription();
  experienceId: string;
  userIcon: any;

  iconCompleted: any;
  iconBlocked: any;
  iconAvailable: any;
  iconSelected: any;
  iconSplit: any;

  userMarker: any;
  markers: {};
  circleMarkers: {};
  location = {};

  radius: number[];

  mapHeight: number;
  mapWidth: number;

  mapCenter: { x, y };
  indicators: {};

  removeBottom: boolean;
  resized: boolean;

  selectedActivity: core.ActivityModel;

  centerMapOnUser: boolean;
  madeSetView: boolean;

  rotation: number;

  centerTimer: number;
  centerTimerDefault: number;
  interval: any;

  private map;
  constructor(
    private st: Store<store.DashboardState>,
    private router: Router,
    public cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {

    this.userIcon = L.icon({
      iconUrl: ('assets/imgs/pin_user_tri.svg'),
      // shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });

    this.iconCompleted = L.icon({
      iconUrl: ('assets/imgs/pin_completed.svg'),
      // shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconAvailable = L.icon({
      iconUrl: ('assets/imgs/pin_activity.svg'),
      // shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconBlocked = L.icon({
      iconUrl: ('assets/imgs/pin_blocked.svg'),
      // shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconSelected = L.icon({
      iconUrl: ('assets/imgs/pin_selected.svg'),
      // shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.iconSplit = L.icon({
      iconUrl: ('assets/imgs/pin_split.svg'),
      // shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
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
          console.log('MAP NULL');
          this.initMap();
        }
        this.cd.detectChanges();
      } else {
        this.removeBottom = true;
      }

    });
    this.subscription.add(sub);
    this.setLocationSubscription();
  }

  ngAfterViewInit() {
    this.getMapMeasures();
  }

  setLocationSubscription() {
    const sub2 = this.st.pipe(select(store.getExperienceLocation)).subscribe(location => {
      if (location != null && this.map != null) {
        console.log(location);
        let locationWasNull = false;
        if (this.location == null) {
          this.madeSetView = true;
          this.map.setView(location, this.curZoom, true);
          // this.map.setBearing(90);
          locationWasNull = true;
          this.map.spin(false);
        }
        if (this.centerMapOnUser) {
          this.madeSetView = true;
          this.map.setView(location, this.curZoom, true);
          // this.map.setBearing(90);
        }
        if (this.userMarker == null) {
          console.log(location);
          this.userMarker = L.marker(location, { icon: this.userIcon }).addTo(this.map);
        } else {
          this.userMarker.setLatLng(location);
        }
        this.location = location;

        if (locationWasNull) {
          this.map.spin(false);
          this.createCenterLocation();
          this.setActivitiesOnMap();
          this.setMapListener();
          this.createSizesListener();

        }
        this.map.spin(false);
        // this.getMapMeasures();
        this.createCircles();


      }

    });
    this.subscription.add(sub2);
  }

  createSizesListener() {
    const sub5 = fromEvent(window, 'resize').subscribe((event: UIEvent) => {
      this.resizeMap();

    });
    this.subscription.add(sub5);
  }

  getMapMeasures() {
    // alert('aaaa');
    // console.log(this.mapElement.nativeElement.getBoundingClientRect());
    this.mapHeight = this.mapElement.nativeElement.clientHeight - this.mapElement.nativeElement.getBoundingClientRect().top;
    this.mapWidth = this.mapElement.nativeElement.clientWidth;
    console.log('Map height:' + this.mapHeight);
    console.log('ClientHeight height:' + this.mapElement.nativeElement.clientHeight);
    console.log(this.resized, this.removeBottom);
    if (this.resized) {
      this.mapHeight += this.mapElement.nativeElement.getBoundingClientRect().top;
      this.resized = false;
    }
    if (this.removeBottom) {
      this.mapHeight -= this.mapElement.nativeElement.getBoundingClientRect().top + 20;
    }

    this.mapCenter = { x: this.mapWidth / 2, y: this.mapHeight / 2 };

    console.log('Map height:' + this.mapHeight);
  }

  resizeMap() {
    this.map.invalidateSize();
    this.removeBottom = false;
    this.resized = true;
    this.cd.detectChanges();
    this.getMapMeasures();
  }

  createEnterSubscription() {
    this.st.pipe(select(store.getSelectedExperienceId), take(1)).subscribe(value => this.experienceId = value);
    this.mapUrl = '/experiences/' + this.experienceId + '/radar';
    this.inited = true;
    const sub2 = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        console.log(e.url);
        if (e.url === this.mapUrl && !this.inited) {
          console.log('MAP ENTERED');
          this.restart();
          // console.log(this.child);
          // this.child.restart();

        }
      });
    this.subscription2.add(sub2);
  }

  startVariables() {
    this.markers = {};
    this.location = null;
    this.map = null;
    this.userMarker = null;
    this.circleMarkers = {};
    this.indicators = {};
    this.selectedActivity = null;
    this.centerMapOnUser = true;
    this.removeBottom = false;
    this.resized = false;
    this.madeSetView = false;
    this.rotation = 0;
    this.centerTimerDefault = 3;
    this.centerTimer = this.centerTimerDefault;
    this.interval = null;

    this.radius = [];
    this.radius.push(500);
    this.radius.push(400);
    this.radius.push(300);
    this.radius.push(200);
    this.radius.push(100);
    this.cd.detectChanges();
  }

  restart() {
    this.subscription = new Subscription();
    const sub = this.activities$.subscribe(activities => {
      this.activities = activities;
      this.cd.detectChanges();
    });
    this.subscription.add(sub);

    this.startVariables();
    this.mapParent.nativeElement.appendChild(this.mapElement.nativeElement);
    // console.log(this.mapElement.nativeElement.clientHeight);
    this.initMap();
    setTimeout(() => { if (this.map != null) { this.resizeMap(); this.setindicators(); } }, 400);
    // this.getMapMeasures();
    this.setLocationSubscription();
  }

  destroyMap() {
    if (this.map != null) {
      this.map.spin(false);
      this.map.eachLayer((layer) => { this.map.removeLayer(layer); });
      this.map.off();
      this.map.remove();
      this.map = null;

      Object.keys(this.indicators).forEach(key => {
        this.mapContainer.nativeElement.removeChild(this.indicators[key]);
      });

      this.mapParent.nativeElement.removeChild(this.mapElement.nativeElement);
    }

  }

  destroy() {
    this.inited = false;
    clearInterval(this.interval);
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
      rotate: true,
      touchRotate: true,
      dragging: true,
      tap: !L.Browser.mobile
    });

    // this.map.compassBearing.enable();



    // this.map.setMaxBounds([[-90, -180], [90, 180]]);

    this.map.options.inertiaMaxSpeed = 0;
    this.map.options.zoomSnap = 1;
    this.map.options.zoomDelta = 1;
    this.map.options.maxBoundsViscosity = 1;
    this.map.spin(true);

    if (this.location == null) {
      this.map.spin(true);
    } else {
      this.map.spin(true);
    }

    // L.marker([41.1096614, -8.615795], { icon: this.icon }).addTo(this.map);

    /*const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 12,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    tiles.on('tileerror', (error, tile) => {
      console.log('TILES ERROR');
      console.log(error);
    });

    tiles.addTo(this.map);*/

    setTimeout(() => { if (this.map != null) { this.map.invalidateSize(); } }, 100);

    // this.startTimer();

    const sub = this.activitiesSequence$.subscribe(activities => {
      let activitiesSequence;
      this.st.pipe(select(store.getActivitiesSequence), take(1)).subscribe(value => activitiesSequence = value);
      this.setSequenceLines(activitiesSequence);
    });
    this.subscription.add(sub);

    const comp = new L.Control.Compass({ autoActive: true, textErr: ' ' });
    comp.on('compass:rotated', (data) => {
      if (this.location != null) {
        console.log(data);
        console.log('ANGLE: ' + data.angle);
        if (data.angle === 0) {
          this.rotation = 360;
        } else {
          this.rotation = data.angle;
        }
        if (this.centerMapOnUser) {
          this.map.setBearing(this.rotation);
          this.map.invalidateSize();
          // this.createCircles();
          this.setindicators();
        }

      }

    });

    this.map.addControl(comp);
  }

  setindicators() {
    this.activities.forEach(activity => {
      const latLng = this.map.latLngToContainerPoint([activity.lat, activity.lng]);
      // console.log([activity.lat, activity.lng], latLng);
      // console.log(this.mapHeight, this.mapWidth);
      if (((latLng.x < 0 || latLng.x > this.mapWidth)) || (latLng.y < 0 || latLng.y > this.mapHeight)) {
        const newCoords = this.projectPoint(latLng.x, latLng.y);
        if (Object.keys(this.indicators).length === 0) {
          this.createIndicator(newCoords, activity.id, { lat: activity.lat, lng: activity.lng });
        } else {
          if (this.indicators[activity.id] != null) {
            this.changeIndicator(newCoords, activity.id, { lat: activity.lat, lng: activity.lng });
          } else {
            this.createIndicator(newCoords, activity.id, { lat: activity.lat, lng: activity.lng });
          }
        }
        // console.log(latLng, newCoords);

      } else {
        if (Object.keys(this.indicators).length !== 0) {
          if (this.indicators[activity.id] != null) {
            // console.log('DELETE');
            this.mapContainer.nativeElement.removeChild(this.indicators[activity.id]);
            delete this.indicators[activity.id];
          }
        }
      }
    });
  }

  setSequenceLines(activities: core.ActivityModel[]) {
    /* Show lines */
    const line = activities.map(activity => [activity.lat, activity.lng]);
    L.polyline(line, { color: '#5E4068' }).addTo(this.map);
  }

  setMapListener() {
    this.map.on('moveend', (e) => {
      // this.map.invalidateSize();
      // console.log('MOVEEND');
      if (this.madeSetView) {
        this.madeSetView = false;
        this.centerMapOnUser = true;
      } else {
        if (this.interval === null) {
          this.startTimer();
        }
        this.centerTimer = this.centerTimerDefault;
        this.centerMapOnUser = false;
      }
      // console.log('MOVEEND');
      // console.log(this.mapHeight);
      this.setindicators();

    });

    this.map.on('click', (e) => {
      // console.log('MOVEEND');
      // console.log('CLICK');
      // this.rotation += 15;
      // this.map.setBearing(this.rotation);
      if (this.selectedActivity != null) {
        this.setMarkerColor(this.selectedActivity);
        this.selectedActivity = null;
        this.cd.detectChanges();
        this.resizeMap();
        this.setindicators();
      }

    });
  }

  getLeftTop(newCoords) {
    let left = newCoords.x;
    let top = newCoords.y;

    const iconWidth = this.indicator.el.clientWidth;
    const iconHeight = this.indicator.el.clientHeight;

    // console.log(this.mapWidth, this.mapHeight);

    // console.log(this.mapHeight);
    // console.log(left, top);
    if (left < iconWidth) {
      left = 0;
    } else if (left > this.mapWidth - iconWidth) {
      left = this.mapWidth;
    }

    if (top < iconHeight) {
      top = 0;
    } else if (top > this.mapHeight - iconHeight) {
      top = this.mapHeight;
    }

    if (left === this.mapWidth) {
      left = left - iconWidth;
    } else if (left !== 0) {
      left -= iconWidth / 2;
    }

    if (top === this.mapHeight) {
      top = top - iconHeight;
    } else if (top !== 0) {
      top -= iconHeight / 2;
    }

    // console.log(left, top);

    return { l: left, t: top };
  }

  getOpacity(geoCoords): number {
    const dist = core.distance(geoCoords.lat, geoCoords.lng, this.location[0], this.location[1]);
    let opacity = (2000 - (dist - 250)) / 2000;
    opacity = (opacity < 0) ? 0 : opacity;
    return 0.4 + opacity * 0.6;
  }

  createIndicator(newCoords, id, geoCoords) {
    const newIndicator = this.indicator.el.cloneNode(true);
    const leftTop = this.getLeftTop(newCoords);

    newIndicator.style.opacity = this.getOpacity(geoCoords);

    newIndicator.style.visibility = 'visible';
    newIndicator.style.left = leftTop.l + 'px';
    newIndicator.style.top = leftTop.t + 'px';
    newIndicator.style.transform = 'rotate(' + newCoords.deg + 'deg)';
    newIndicator.onclick = (e) => {
      this.map.setView([e.target.getAttribute('data-lat'), e.target.getAttribute('data-lng')], this.curZoom, true);
      // this.map.setBearing(90);
    };
    newIndicator.setAttribute('data-lat', geoCoords.lat);
    newIndicator.setAttribute('data-lng', geoCoords.lng);

    // console.log(leftTop.l, leftTop.t);

    this.mapContainer.nativeElement.appendChild(newIndicator);

    this.indicators[id] = newIndicator;
  }

  changeIndicator(newCoords, id, geoCoords) {
    const leftTop = this.getLeftTop(newCoords);

    this.indicators[id].style.opacity = this.getOpacity(geoCoords);
    this.indicators[id].style.left = leftTop.l + 'px';
    this.indicators[id].style.top = leftTop.t + 'px';
    this.indicators[id].style.transform = 'rotate(' + newCoords.deg + 'deg)';

    this.indicators[id].setAttribute('data-coordinates', geoCoords);
  }

  createCenterLocation() {
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
          tooltip: 'Centre on my location',
        },
      },
      addHooks: () => {
        this.madeSetView = true;
        this.map.setView(this.location, this.curZoom, true);
        // this.map.setBearing(90);

        ImmediateSubAction.prototype.addHooks.call(this);
      }
    });
    new L.Toolbar2.Control({
      position: 'topleft',
      actions: [centerOnMyLocation]
    }).addTo(this.map);
  }

  setActivitiesOnMap() {
    this.activities.forEach(activity => {

      if (this.markers[activity.id] == null) {

        // console.log(activity.distance);
        const marker = L.marker([activity.lat, activity.lng], { icon: this.iconBlocked }).addTo(this.map);
        // console.log([activity.lat, activity.lng], this.map.latLngToContainerPoint([activity.lat, activity.lng]));
        marker.on('click', (e) => {
          /*this.rotation += 5;
          this.mapContainer.nativeElement.style.webkitTransform =
            this.mapContainer.nativeElement.style.transform =
          'rotate(' + this.rotation + 'deg)';*/
          // this.map.invalidateSize();
          if (this.selectedActivity != null) {
            this.setMarkerColor(this.selectedActivity);
          }
          this.selectedActivity = activity;

          marker.setIcon(this.iconSelected);
          this.cd.detectChanges();
          this.resizeMap();
          this.setindicators();
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

  createCircles() {
    if (Object.keys(this.circleMarkers).length === 0) {
      this.radius.forEach(rad => {
        this.circleMarkers[rad] = L.circle(this.location, rad, { opacity: .4, color: '#7c79a6' }).addTo(this.map);
      });
    } else {
      this.radius.forEach(rad => {
        this.circleMarkers[rad].setLatLng(this.location);
      });
    }
  }

  projectPoint(x, y) {
    let newX;
    let newY;
    const m = ((y - this.mapCenter.y) / (x - this.mapCenter.x));
    const b = y - m * x;
    // console.log(x, y);
    if ((x < 0 || x > this.mapWidth)) {
      if (x < 0) {
        newX = 0;
        newY = m * newX + b;
        if (newY < 0 || newY > this.mapHeight) {
          if (newY < 0) {
            newY = 0;
          } else {
            newY = this.mapHeight;
          }
          newX = (newY - b) / m;
          if (newX < 0) {
            newX = 0;
          } else if (newX > this.mapWidth) {
            newX = this.mapWidth;
          }
        }
      } else {
        newX = this.mapWidth;
        newY = m * newX + b;
        if (newY < 0 || newY > this.mapHeight) {
          if (newY < 0) {
            newY = 0;
          } else {
            newY = this.mapHeight;
          }
          newX = (newY - b) / m;
          if (newX < 0) {
            newX = 0;
          } else if (newX > this.mapWidth) {
            newX = this.mapWidth;
          }
        }

      }
    } else if (y < 0 || y > this.mapHeight) {
      if (y < 0) {
        newY = 0;
        newX = (newY - b) / m;
        if (newX < 0 || newX > this.mapWidth) {
          if (newX < 0) {
            newX = 0;
          } else {
            newX = this.mapWidth;
          }
          newY = m * newX + b;
          if (newY < 0) {
            newY = 0;
          } else if (newY > this.mapHeight) {
            newY = this.mapHeight;
          }
        }
      } else {
        newY = this.mapHeight;
        newX = (newY - b) / m;
        if (newX < 0 || newX > this.mapWidth) {
          if (newX < 0) {
            newX = 0;
          } else {
            newX = this.mapWidth;
          }
          newY = m * newX + b;
          if (newY < 0) {
            newY = 0;
          } else if (newY > this.mapHeight) {
            newY = this.mapHeight;
          }
        }

      }
    }
    const dy = y - this.mapCenter.y;
    const dx = x - this.mapCenter.x;
    const theta = Math.atan2(dy, dx);
    const d = theta * (180 / Math.PI);
    // if (d < 0) { d = d - 180; }
    return { x: newX, y: newY, deg: d };
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
      console.log('NO PARENTS');
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

  startTimer() {
    this.interval = setInterval(() => {
      this.centerTimer--;
      if (this.centerTimer === 0) {
        if (this.location != null) {
          this.madeSetView = true;
          this.map.setView(this.location, this.curZoom, true);
        }
      }
    }, 1000);
  }
}
