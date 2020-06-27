import {
  Component, OnInit, ChangeDetectionStrategy, ViewChild,
  ElementRef, Input, ChangeDetectorRef, OnDestroy, AfterViewInit
} from '@angular/core';
import * as L from 'leaflet';
import * as ELG from 'esri-leaflet-geocoder';
import { ModalController } from '@ionic/angular';
import { ToastService, ActivityModel, distance, LocalStorageService } from 'src/app/core';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as store from './../../../dashboard/store';
import 'leaflet-spin/leaflet.spin.js';
import 'leaflet-toolbar/dist/leaflet.toolbar.js';
import 'leaflet-compass/dist/leaflet-compass.min.js';
import { take, filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { core } from '@angular/compiler';
import { CommonStoreActionService } from 'src/app/core/services/commonStoreActions.service';
import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-map-media',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-media.component.html',
  styleUrls: ['./map-media.component.scss'],
})
export class MapMediaComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('mapParent') mapParent: ElementRef;
  @ViewChild('mapContainer') mapContainer: ElementRef;

  @ViewChild('indicator') indicator: any;
  @Input() media: [];
  @Input() locations: [];
  @Input() userLocation: {};
  @Input() proximity: any;
  @Input() time: any;

  activities$: Observable<ActivityModel[]>;
  goals: boolean[];

  subscription = new Subscription();

  actUrl: string;
  inited = false;
  experienceId: string;

  userIcon: any;
  userMarker: any;
  // markers: {};
  circleMarkers: {};
  circleUserMarkers: {};

  radius: number[];

  curZoom = 16;
  private map;

  timer: number;

  mapHeight: number;
  mapWidth: number;

  mapCenter: { x, y };
  indicators: {};

  removeBottom: boolean;
  resized: boolean;


  hasTimer: boolean;

  interval: any;

  currentImgsWidth: number;
  totalImgsWidth: number;
  imgsWidth: number;

  centerTimer: number;
  centerTimerDefault: number;
  intervalCenter: any;

  rotation: number;

  centerMapOnUser: boolean;
  madeSetView: boolean;

  activity: ActivityModel;

  firstEntryLoca: boolean;

  @Input()
  set setLocation(location) {
    console.log(location);
    this.userLocation = location;
    if (this.map != null) {
      this.updateLocation();
    }

    this.cd.detectChanges();
  }


  constructor(
    public cd: ChangeDetectorRef,
    private toastService: ToastService,
    private st: Store<store.DashboardState>,
    private storage: LocalStorageService,
    public common: CommonStoreActionService,
    public modalController: ModalController,
  ) {

  }

  ngOnInit() {
    //  console.log(this.time);
    this.userIcon = L.icon({
      iconUrl: ('assets/imgs/pin_user_tri.svg'),
      // shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    if (this.proximity === '') {
      this.proximity = 50;
    }

    this.totalImgsWidth = 100 + this.locations.length * 116;
    this.currentImgsWidth = 0;

    if (this.time != null && this.time !== '') {
      this.hasTimer = true;
      this.timer = this.time;
    } else {
      this.hasTimer = false;
    }
    this.st.pipe(select(store.getSelectedExperienceId), take(1)).subscribe(value => this.experienceId = value);
    this.st.pipe(select(store.getSelectedActivity), take(1)).subscribe(value => this.activity = value);
    // console.log(this.activity.goals);
    /* if (Object.keys(this.activity.goals).length === 0) {
       this.setGoals();
     } else {
       console.log(this.activity.goals);
     }*/
    this.activities$ = this.st.pipe(select(store.getAllAvailableActivities));
    const sub = this.activities$.subscribe(aaa => {
      console.log('NEW ACTIVITIES');
      // console.log(this.goals);
      if (!this.activity.completed) {
        this.st.pipe(select(store.getActivityGoals(this.activity.id)), take(1)).subscribe(value => this.goals = value);
        if (this.goals.length === 0) {
          console.log('aqui1');
          this.setGoals();
        }
        if (!this.hasTimer) {
          this.storage.setActivityGoalsCompleted(this.experienceId, this.activity.id, this.goals);
        }

        if (!this.checkGoalsCompleted() && this.activity.goals.length > 0) {
          this.checkGoals();
        }


      } else {
        this.goals = Array(this.locations.length).fill(true);
      }


      this.cd.detectChanges();
    });
    this.subscription.add(sub);

    this.cd.detectChanges();
    this.startVariables();
    this.initMap();
    this.updateLocation();

    this.createSizesListener();
  }

  createSizesListener() {
    const sub5 = fromEvent(window, 'resize').subscribe((event: UIEvent) => {
      this.resizeMap();

    });
    this.subscription.add(sub5);
  }

  async setGoals() {
    const newGoals = Array(this.locations.length).fill(false);
    await this.st.dispatch(new store.SetActivityGoals(newGoals, this.activity.id));
  }

  async checkGoals() {
    if (this.userLocation != null) {
      for (const [i, loc] of this.locations.entries()) {
        const l: { lat: number, lng: number } = Object.assign({}, loc);
        const dist = distance(l.lat, l.lng, this.userLocation[0], this.userLocation[1]);
        let completed;
        this.st.pipe(select(store.getActivityGoalCompleted(this.activity.id, i)), take(1)).subscribe(value => completed = value);
        if (dist <= this.proximity && !completed) {
          await this.st.dispatch(new store.MarkActivityGoalCompleted(i, this.activity.id));
        }
      }
    }

  }

  updateLocation() {
    // console.log(this.userLocation);
    if (this.userLocation != null) {
      if (!this.checkGoalsCompleted() && this.activity.goals.length > 0) {
        this.checkGoals();
      }
      if (this.centerMapOnUser) {
        if (!this.firstEntryLoca) {
          this.madeSetView = true;
        } else {
          this.firstEntryLoca = false;
        }

        this.map.setView(this.userLocation, this.curZoom, true);
      }
      console.log(this.userMarker);
      if (this.userMarker == null) {
        this.userMarker = L.marker(this.userLocation, { icon: this.userIcon }).addTo(this.map);
        this.map.spin(false);
        this.createControls();
      } else {
        this.userMarker.setLatLng(this.userLocation);
      }
      this.getMapMeasures();

      this.createUserCircles();
    }
  }

  getMapMeasures() {
    // alert('aaaa');
    // console.log(this.mapElement.nativeElement.getBoundingClientRect());
    console.log(this.mapElement.nativeElement.getBoundingClientRect());
    this.mapHeight = this.mapElement.nativeElement.clientHeight - 5;
    this.mapWidth = this.mapElement.nativeElement.clientWidth;
    // console.log('Map height:' + this.mapHeight);
    /*if (this.resized) {
      this.mapHeight += this.mapElement.nativeElement.getBoundingClientRect().top;
      this.resized = false;
    }*/
    /*if (this.removeBottom) {
      this.mapHeight -= this.mapElement.nativeElement.getBoundingClientRect().top;

    }*/
    this.mapCenter = { x: this.mapWidth / 2, y: this.mapHeight / 2 };

    this.imgsWidth = this.mapWidth - 60;

    console.log(this.totalImgsWidth, this.imgsWidth);

    // console.log('Map height:' + this.mapHeight);
  }

  resizeMap() {
    this.map.invalidateSize();
    // this.removeBottom = false;
    this.resized = true;

    this.getMapMeasures();
  }

  startVariables() {
    this.map = null;
    this.userMarker = null;
    // this.removeBottom = false;
    this.resized = false;
    this.mapCenter = { x: 0, y: 0 };
    this.mapWidth = 0;
    this.mapHeight = 0;
    this.circleMarkers = {};
    this.circleUserMarkers = {};
    this.indicators = {};
    this.rotation = 0;
    this.centerMapOnUser = true;
    this.madeSetView = false;
    this.firstEntryLoca = true;

    this.centerTimerDefault = 3;
    this.centerTimer = this.centerTimerDefault;
    this.intervalCenter = null;

    this.radius = [];
    this.radius.push(500);
    this.radius.push(400);
    this.radius.push(300);
    this.radius.push(200);
    this.radius.push(100);
    this.cd.detectChanges();
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
      this.cd.detectChanges();
    }

  }

  destroy() {
    this.inited = false;
    this.map.spin(false);
    this.destroyMap();
    clearInterval(this.interval);
    clearInterval(this.intervalCenter);
    console.log('DESTORY');
  }

  ngOnDestroy() {
    this.destroy();
    this.subscription.unsubscribe();
    console.log('NGONDESTORY');
  }


  private initMap(): void {
    this.map = L.map('map', {
      loadingControl: true,
      center: [41.106389848835605, -8.60714435577392],
      zoom: this.curZoom,
      dragging: true,
      rotate: true,
      touchRotate: true,
      tap: !L.Browser.mobile
    });

    this.map.setMaxBounds([[-90, -180], [90, 180]]);

    this.map.options.inertiaMaxSpeed = 0;
    this.map.options.zoomSnap = 1;
    this.map.options.zoomDelta = 1;
    this.map.options.maxBoundsViscosity = 1;
    this.map.options.maxZoom = this.curZoom;
    this.map.options.minZoom = this.curZoom;
    this.map.spin(true);




    /*const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: this.curZoom,
      minZoom: this.curZoom,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    tiles.on('tileerror', (error, tile) => {
      this.toastService.presentToast(`Error getting parts of the map`, 'danger');
      console.log('TILES ERROR');
      console.log(error);
      console.log(tile);
    });

    tiles.addTo(this.map);*/

    setTimeout(() => { if (this.map != null) { this.map.invalidateSize(); } }, 100);

    const comp = new L.Control.Compass({ autoActive: true, textErr: ' ' });
    comp.on('compass:rotated', (data) => {
      if (this.userLocation != null) {
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
          this.setIndicators();
        }
      }

    });

    this.map.addControl(comp);

    // this.setActivitiesOnMap();
    // this.setMapListeners();

  }

  setIndicators() {
    for (const [i, loc] of this.locations.entries()) {
      const l: { lat: number, lng: number } = Object.assign({}, loc);
      const latLng = this.map.latLngToContainerPoint([l.lat, l.lng]);
      // console.log([activity.lat, activity.lng], latLng);
      // console.log(this.mapHeight, this.mapWidth);
      if (((latLng.x < 0 || latLng.x > this.mapWidth)) || (latLng.y < 0 || latLng.y > this.mapHeight)) {
        const newCoords = this.projectPoint(latLng.x, latLng.y);
        if (Object.keys(this.indicators).length === 0) {
          this.createIndicator(newCoords, i, l);
        } else {
          if (this.indicators[i] != null) {
            this.changeIndicator(newCoords, i, l);
          } else {
            this.createIndicator(newCoords, i, l);
          }
        }
        // console.log(latLng, newCoords);

      } else {
        if (Object.keys(this.indicators).length !== 0) {
          if (this.indicators[i] != null) {
            // console.log('DELETE');
            this.mapContainer.nativeElement.removeChild(this.indicators[i]);
            delete this.indicators[i];
          }
        }
      }
    }
  }

  setMapListener() {
    console.log('setMapListener');
    this.map.on('moveend', (e) => {
      // this.map.invalidateSize();
      // console.log('MOVEEND');
      console.log(this.madeSetView);
      if (this.madeSetView) {
        this.madeSetView = false;
        this.centerMapOnUser = true;
      } else {
        if (this.intervalCenter === null) {
          this.startCenterTimer();
        }
        this.centerTimer = this.centerTimerDefault;
        this.centerMapOnUser = false;
      }
      // console.log(this.mapHeight);
      this.setIndicators();
      // this.createCircles();
    });
  }

  createCircles() {
    for (const [i, loc] of this.locations.entries()) {
      this.circleMarkers[i] = L.circle(loc, 25, { color: 'green' }).addTo(this.map);
    }
  }

  createUserCircles() {
    if (Object.keys(this.circleUserMarkers).length === 0) {
      this.radius.forEach(rad => {
        this.circleUserMarkers[rad] = L.circle(this.userLocation, rad, { opacity: .1, color: '#7c79a6' }).addTo(this.map);
      });
    } else {
      this.radius.forEach(rad => {
        this.circleUserMarkers[rad].setLatLng(this.userLocation);
      });
    }
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
    const dist = distance(geoCoords.lat, geoCoords.lng, this.userLocation[0], this.userLocation[1]);
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
        this.map.setView(this.userLocation, this.curZoom, true);
        ImmediateSubAction.prototype.addHooks.call(this);
      }
    });
    new L.Toolbar2.Control({
      position: 'topleft',
      actions: [centerOnMyLocation]
    }).addTo(this.map);

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

  startTimer() {

    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        if (this.checkGoalsCompleted()) {
          this.common.completeActivity(this.activity, this.experienceId);
          this.hasTimer = false;
          clearInterval(this.interval);
        } else {
          this.setGoals();
          if (this.activity.goals.length > 0) {
            this.checkGoals();
          }
          this.timer = this.time;
          this.toastService.presentToast(`You ran out of time to complete this activity!`, 'warning');


        }


      }
      this.cd.detectChanges();
    }, 1000);
  }

  startCenterTimer() {
    this.intervalCenter = setInterval(() => {
      this.centerTimer--;
      if (this.centerTimer === 0) {
        if (this.userLocation != null) {
          this.madeSetView = true;
          this.map.setView(this.userLocation, this.curZoom, true);
        }
      }
    }, 1000);
  }

  checkGoalsCompleted(): boolean {
    let goalsCompleted;
    this.st.pipe(select(store.getAllActivityGoalsCompleted(this.activity.id)), take(1)).subscribe(value => goalsCompleted = value);
    return goalsCompleted;
  }

  ngAfterViewInit() {
    console.log('afterviewinit');
    console.log(this.hasTimer);
    setTimeout(() => {
      if (this.map != null) {
        this.getMapMeasures(); this.setMapListener();
        this.setIndicators(); this.createCircles();
      }
    }, 400);


    if (!this.checkGoalsCompleted() && !this.activity.completed) {
      if (this.hasTimer) {
        this.startTimer();
      }
    } else {
      this.hasTimer = false;
      this.cd.detectChanges();
    }


  }

  async openImageModal(image) {
    const modal = await this.modalController.create({
      component: ImageModalComponent,
      componentProps: { img: image },
      cssClass: 'modalClass',
    });

    modal.onDidDismiss()
      .then((result) => {
        if (result.data === 'confirm') {

        }
      });

    return await modal.present();
  }

  move(event, right) {
    const imgs = event.target.parentNode.children[0].children;
    if (right) {
      this.currentImgsWidth += 116;
    } else {
      this.currentImgsWidth -= 116;
    }
    if (this.currentImgsWidth > 0) {
      this.currentImgsWidth = 0;
      return;
    } else if (this.imgsWidth - this.currentImgsWidth > this.totalImgsWidth + 116) {
      this.currentImgsWidth += 116;
      return;
    }
    for (const img of imgs) {
      img.style.webkitTransform =
        img.style.transform =
        'translate(' + this.currentImgsWidth + 'px)';
    }

  }
}
