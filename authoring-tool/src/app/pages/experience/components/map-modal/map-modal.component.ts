import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, Input } from '@angular/core';
import * as L from 'leaflet';
import * as ELG from 'esri-leaflet-geocoder';
import { ToastService } from 'src/app/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-map-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, OnDestroy {
  @ViewChild('map2') mapElement: ElementRef;
  @ViewChild('mapParent') mapParent: ElementRef;

  @Input() coords: { lat: number, lng: number };
  @Input() location: { lat: number, lng: number };

  newLocation: {};
  marker: any;
  private map;
  icon: any;
  curZoom = 15;

  constructor(public cd: ChangeDetectorRef, private toastService: ToastService, public modalController: ModalController) { }

  ngOnInit() {
    this.icon = L.icon({
      iconUrl: ('assets/imgs/pin_activity.svg'),
      shadowUrl: ('assets/imgs/marker-shadow.png'),
      iconAnchor: [12, 41]
    });
    this.map = null;
    this.marker = null;
    this.newLocation = null;
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map != null) {
      this.map.eachLayer((layer) => { this.map.removeLayer(layer); });
      this.map.off();
      this.map.remove();
      this.map = null;

      this.mapParent.nativeElement.removeChild(this.mapElement.nativeElement);
    }
  }

  private initMap(): void {
    if (this.location != null) {
      this.coords = this.location;
    }
    this.map = L.map('map2', {
      loadingControl: true,
      center: [this.coords.lat, this.coords.lng],
      zoom: this.curZoom,
      dragging: true,
      tap: !L.Browser.mobile
    });

    this.map.setMaxBounds([[-90, -180], [90, 180]]);

    this.map.options.inertiaMaxSpeed = 0;
    this.map.options.zoomSnap = 1;
    this.map.options.zoomDelta = 1;
    this.map.options.maxBoundsViscosity = 1;

    this.map.setView(this.coords, this.curZoom);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    tiles.on('tileerror', (error, tile) => {
      this.toastService.presentToast(`Error getting parts of the map`, 'danger');
      console.log('TILES ERROR');
      console.log(error);
    });

    tiles.addTo(this.map);

    setTimeout(() => { if (this.map != null) { this.map.invalidateSize(); } }, 100);

    if (this.location != null) {
      this.marker = L.marker(this.location, { icon: this.icon }).addTo(this.map);
    }

    // this.setActivitiesOnMap();
    this.setMapListeners();
    this.createControls();
  }

  setMapListeners() {
    this.map.on('click', (e) => {
      // console.log('MOVEEND');
      if (this.marker == null) {
        this.marker = L.marker(e.latlng, { icon: this.icon }).addTo(this.map);
      } else {
        this.marker.setLatLng(e.latlng);
      }
      this.newLocation = e.latlng;
      this.cd.detectChanges();

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
          tooltip: 'Center on the activity\'s location'
        },
      },
      addHooks: () => {
        this.map.setView(this.coords, this.curZoom);
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

        this.map.setView(data.results[i].latlng, this.curZoom);
      }
    });
  }

  selectLocation(confirm) {
    if (confirm) {
      this.modalController.dismiss({
        data: this.newLocation
      }, 'confirm');
    } else {
      this.modalController.dismiss(null, 'cancel');
    }
  }

}
