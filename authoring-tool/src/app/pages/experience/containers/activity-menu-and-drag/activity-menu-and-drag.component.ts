import {
  Component, OnInit, ChangeDetectionStrategy, AfterViewInit, Input, ViewChild,
  ElementRef, ChangeDetectorRef, OnDestroy, ViewContainerRef, ComponentFactoryResolver, Renderer2
} from '@angular/core';
import interact from 'interactjs';
import { Store, select, ActionsSubject } from '@ngrx/store';
import * as store from './../../../experience/store';
import * as core from './../../../../core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { PreviewExperienceModalComponent } from '../../components';
import * as cytoscape from 'cytoscape';
import * as edgehandles from 'cytoscape-edgehandles';
import * as cxtmenu from 'cytoscape-cxtmenu';
import { Platform, ModalController, AlertController } from '@ionic/angular';
import { UpdateActivityComponent } from '../update-activity/update-activity.component';
import { UpdateExperienceComponent } from '../update-experience/update-experience.component';
import { UpdateConnectionComponent } from '../update-connection/update-connection.component';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import * as ELG from 'esri-leaflet-geocoder';
import 'leaflet-toolbar/dist/leaflet.toolbar.js';


import { UndoRedoComponent } from '../undo-redo/undo-redo.component';
import { UploadFileService, ToastService } from './../../../../core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export enum KEY_CODE {
  DEL_KEY = 'Delete',
  BACKSPACE_KEY = 'Backspace'
}

cytoscape.use(edgehandles);
cytoscape.use(cxtmenu);


@Component({
  selector: 'app-activity-menu-and-drag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-menu-and-drag.component.html',
  styleUrls: ['./activity-menu-and-drag.component.scss'],

})
export class ActivityMenuAndDragComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() experience: core.ExperienceModel;

  activities$: Observable<core.ActivityModel[]>;
  connections$: Observable<core.ConnectionModel[]>;
  modules$: Observable<core.ModuleModel[]>;
  hasChanges$: Observable<boolean>;

  @ViewChild('sourceDiv') sourceDiv: ElementRef;
  @ViewChild('sourceIcon') sourceIcon: any;
  @ViewChild('map') dropzone: ElementRef;
  @ViewChild('mapParent') mapParent: ElementRef;
  @ViewChild('activityCreate') activityCreate: ElementRef;
  @ViewChild('activitySelect') activitySelect: any;
  @ViewChild(UndoRedoComponent) undoRedoComp: UndoRedoComponent;

  @ViewChild('rightMenu') rightMenu: ElementRef;


  @ViewChild('container', { read: ViewContainerRef }) viewContainer: ViewContainerRef;

  private map;

  connections: core.ConnectionModel[];
  inited = false;
  destroyed = false;
  dragged = false;

  updateActivityComponentClass = UpdateActivityComponent;
  updateExperienceComponentClass = UpdateExperienceComponent;
  updateConnectionComponentClass = UpdateConnectionComponent;

  removeElement: { modelId: number, type: string };

  eh: any;
  cxtMenuNodes: any;
  cxtMenuEdges: any;
  cy: any;
  endRect: any;

  connectionsSub: Subscription;
  activitiesSub: Subscription;

  activities: core.ActivityModel[];

  subscription2;
  subscription4 = new Subscription();
  subscription5 = new Subscription();
  subscription6 = new Subscription();
  subscription7;

  clickedActivityBtn = false;

  alertConfirmOpen = false;

  mapView: boolean;

  positionedNodes = {};

  experienceMenuOpen: boolean;
  activityMenuOpen: number;
  connectionMenuOpen: number;

  updateActivityInstance: any;

  showUpdateMenu: boolean;

  rightMenuWidth: number;

  expandMap: boolean;

  recentlyCreatedNode: any;

  setCreated: string;

  setCounter: number;

  activitiesSets = ['Linear', 'Branched', 'Cyclic', 'Exploratory'];
  activitiesSetsIcons = [
    'linear',
    'branched',
    'cyclic',
    'exploratory'
  ];

  constructor(
    private st: Store<store.DashboardState>,
    private renderer: Renderer2,
    public cd: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    public modalController: ModalController,
    public alertController: AlertController,
    private uploadFileService: UploadFileService,
    private toastService: ToastService,
    private platform: Platform,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer) {
    this.activitiesSetsIcons.forEach(icon => {
      iconRegistry.addSvgIcon(
        icon,
        sanitizer.bypassSecurityTrustResourceUrl(`assets/imgs/${icon}.svg`));
    });
  }

  ngOnInit() {
    console.log('INIT ' + this.experience.id);
    this.activities$ = this.st.pipe(select(store.getAllActivities));
    this.connections$ = this.st.pipe(select(store.getAllConnections));
    this.modules$ = this.st.pipe(select(store.getAllModules));
    this.hasChanges$ = this.st.pipe(select(store.getExperiencesHasChanges));

    this.cd.detectChanges();
    this.startFunctions();

  }

  restart() {

    console.log('RESTART');
    this.subscription4 = new Subscription();
    this.undoRedoComp.start();
    this.startFunctions();
    this.mapParent.nativeElement.appendChild(this.dropzone.nativeElement);

    this.ngAfterViewInit();
  }

  startFunctions() {
    this.removeElement = { modelId: null, type: null };
    this.experienceMenuOpen = false;
    this.activityMenuOpen = null;
    this.connectionMenuOpen = null;
    this.updateActivityInstance = null;
    this.showUpdateMenu = true;
    this.rightMenuWidth = 368;
    this.recentlyCreatedNode = null;
    this.setCreated = null;
    this.setCounter = null;
    this.cd.detectChanges();
    this.createDocumentClickSubscription();


  }

  createActivityClickSub() {
    const sub = fromEvent(this.activityCreate.nativeElement, 'click').subscribe(() => {
      console.log('CLICK CREATE');
      if (!this.dragged) {
        this.clickedActivityBtn = !this.clickedActivityBtn;
      } else {
        this.clickedActivityBtn = false;
      }

      this.dragged = false;

      this.cd.detectChanges();

    });
    this.subscription2.add(sub);
  }

  createDocumentClickSubscription() {
    const sub4 = fromEvent(document, 'click').subscribe(() => {
      this.renderer.setStyle(this.dropzone.nativeElement, 'backgroundColor', '#eeeeee');
      this.cy.resize();
      this.cd.detectChanges();
      this.subscription5.unsubscribe();

    });
    this.subscription5.add(sub4);

    this.subscription6 = new Subscription();
  }

  createDeleteListeners() {
    this.removeDeleteListeners();
    const sub4 = fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case KEY_CODE.DEL_KEY:
        case KEY_CODE.BACKSPACE_KEY:
          this.removeItem();
          break;
      }

    });
    this.subscription4.add(sub4);
  }

  removeDeleteListeners() {
    this.subscription4.unsubscribe();
    this.subscription4 = new Subscription();
  }

  createSizesListener() {
    const sub5 = fromEvent(window, 'resize').subscribe((event: UIEvent) => {
      if (!this.mapView) {
        this.expandMap = true;
        this.resizeMap();
      }

    });
    this.subscription2.add(sub5);
  }

  resizeMap() {
    if (this.map != null) {
      this.map.invalidateSize();
      this.setNodesMapPositioned();
    }
  }

  destroy() {
    console.log('DESTROY ' + this.experience.id);

    this.st.dispatch(new store.ClearHistory());

    this.st.dispatch(new store.SetHasChanges(false));

    /*if (this.mapView) {
      this.activityCreate.nativeElement.className = this.activityCreate.nativeElement.className.replace('disabledDiv', '');
      this.activitySelect.nativeElement.className =
        this.activitySelect.nativeElement.className.replace('disabledDiv', '');
    }*/


    this.destroyCy();

    this.destroyMap();

    this.mapParent.nativeElement.removeChild(this.dropzone.nativeElement);

    this.undoRedoComp.destroy();
    this.inited = false;

    this.subscription2.unsubscribe();
    this.subscription4.unsubscribe();
    this.subscription5.unsubscribe();
    this.subscription6.unsubscribe();

    this.destroyed = true;
  }

  ngOnDestroy() {
    console.log('DESTROY ' + this.experience.id);
    if (!this.destroyed) {
      this.destroy();
    }
  }

  addActivity(lat: number, lng: number) {
    let newActivityId;
    this.st.pipe(select(store.getActivitiesNewId()), take(1)).subscribe(value => newActivityId = value);
    let firstModuleID;
    this.st.pipe(select(store.getFirstModuleId()), take(1)).subscribe(value => firstModuleID = value);
    this.recentlyCreatedNode = newActivityId;
    const newActivity = new core.ActivityModel('New Activity', null,
      firstModuleID, lat, lng, '#00D385', '', false, false, 50, 0, 23, [], newActivityId);
    this.st.dispatch(new store.AddActivity(newActivity));
    this.toastService.presentToast(`Activity created`, 'success');
  }

  duplicateActivity(act: core.ActivityModel, lat: number, lng: number) {
    let newActivityId;
    this.st.pipe(select(store.getActivitiesNewId()), take(1)).subscribe(value => newActivityId = value);
    this.recentlyCreatedNode = newActivityId;
    const newActivity = new core.ActivityModel(act.title, null,
      act.moduleId, lat, lng, act.pinColor, act.tags, false, false, act.proximity, act.startHour, act.endHour, [], newActivityId);
    this.st.dispatch(new store.AddActivity(newActivity));
    this.toastService.presentToast(`Activity duplicated`, 'success');
  }

  deleteActivityOrConnection() {
    if (this.removeElement.modelId != null) {
      if (this.removeElement.type === 'node') {
        let removedActivity: core.ActivityModel;
        this.st.pipe(select(store.getActivityById(this.removeElement.modelId)), take(1)).subscribe(value => removedActivity = value);
        let removedActivityModule: core.ModuleModel;
        this.st.pipe(select(store.getModuleById(removedActivity.moduleId)), take(1)).subscribe(value => removedActivityModule = value);
        // console.log(removedActivityModule, removedActivity);
        if (removedActivity.moduleData) {
          if (removedActivityModule != null) {
            removedActivityModule.htmlConfig.forEach(data => {
              if (data.type === 'image' || data.type === 'video' || data.type === 'audio') {
                if (removedActivity.moduleData[data.label]) {
                  console.log('delete ' + data.label);
                  // this.uploadFileService.deleteFile(removedActivity.moduleData[data.label].url);
                }

              }
            });
          }

        }
        this.st.dispatch(new store.RemoveActivity(removedActivity));
        this.toastService.presentToast(`Activity deleted`, 'success');
        this.closeUpdateMenu();

      } else {
        let removedConnection: core.ConnectionModel;
        this.st.pipe(select(store.getConnectionById(this.removeElement.modelId)), take(1)).subscribe(value => removedConnection = value);
        this.st.dispatch(new store.RemoveConnection(removedConnection));
        this.toastService.presentToast(`Connection deleted`, 'success');
        this.closeUpdateMenu();
      }
      this.removeElement = { modelId: null, type: null };
      this.removeDeleteListeners();
      this.cd.detectChanges();

    }

  }

  async updateActivity(act: core.ActivityModel, oldActivity: core.ActivityModel) {

    const activity = new core.ActivityModel(act.title, act.moduleData, act.moduleId,
      act.lat, act.lng, act.pinColor, act.tags, act.startActivity, act.finalActivity, act.proximity,
      act.startHour, act.endHour, act.days, act.id);

    // console.log(activity);
    this.toastService.presentToast(`Activity updated`, 'success');
    await this.st.dispatch(new store.UpdateActivity({ activity, oldActivity }));
    // this.closeUpdateMenu();

    this.cd.detectChanges();
  }


  updateActivityCoordinates(lat: number, lng: number, activityId: number) {
    let oldActivity: core.ActivityModel;
    this.st.pipe(select(store.getActivityById(activityId)), take(1)).subscribe(value => oldActivity = value);
    const activity = new core.ActivityModel(oldActivity.title, oldActivity.moduleData, oldActivity.moduleId,
      oldActivity.lat, oldActivity.lng, oldActivity.pinColor, oldActivity.tags, oldActivity.startActivity, oldActivity.finalActivity,
      oldActivity.proximity, oldActivity.startHour, oldActivity.endHour, oldActivity.days, oldActivity.id);
    activity.lat = lat;
    activity.lng = lng;
    if (this.updateActivityInstance != null) {
      if (this.updateActivityInstance.activity.id === activityId) {
        this.updateActivityInstance.coords.lat = lat;
        this.updateActivityInstance.coords.lng = lng;
        this.setActivityInstanceAddress(lat, lng);
      } else {
        this.openUpdateActivityMenu(activity);
      }
    } else {
      this.openUpdateActivityMenu(activity);
    }

    this.st.dispatch(new store.UpdateActivity({ activity, oldActivity }));
    this.toastService.presentToast(`Activity geographic coordinates updated`, 'success');
  }

  setActivityInstanceAddress(lat, lng) {
    ELG.geocodeService().reverse().latlng([lat, lng]).run((error, result) => {
      if (error != null) {
        this.toastService.presentToast(`Error getting the address of the selected activity.`, 'danger');
        console.log(error);
        return;
      }
      if (this.updateActivityInstance == null) {
        return;
      }
      this.updateActivityInstance.address = result.address.LongLabel;
      this.updateActivityInstance.originalAddress = result.address.LongLabel;
      this.updateActivityInstance.cd.detectChanges();
      // L.marker(result.latlng).addTo(this.map).bindPopup(result.address.Match_addr).openPopup();
    });
  }

  openUpdateActivityMenu(act: core.ActivityModel) {
    if (this.activityMenuOpen === act.id) {
      return;
    }
    if (!this.showUpdateMenu) {
      this.showHideMenu();
    }
    // console.log(act);
    this.selectNode(this.cy.$id(act.id));
    // this.removeDeleteListeners();
    this.removeComponent();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.updateActivityComponentClass);
    const component = this.viewContainer.createComponent(componentFactory);
    let acts: core.ActivityModel[];
    this.st.pipe(select(store.getAllActivities), take(1)).subscribe(value => acts = value);
    acts = acts.filter((newAct) => newAct.id !== act.id);

    this.updateActivityInstance = component.instance;
    this.updateActivityInstance.activity = act;
    this.updateActivityInstance.activities = acts;
    this.updateActivityInstance.modules$ = this.modules$;
    this.updateActivityInstance.componentType = 'component';

    this.setActivityInstanceAddress(act.lat, act.lng);

    const sub = this.updateActivityInstance.closeForm.subscribe(() => this.closeUpdateActivityMenuConfirmation());
    this.subscription6.add(sub);
    const sub2 = this.updateActivityInstance.saveForm.subscribe((newPackage) => this.updateActivity(newPackage.new, newPackage.old));
    this.subscription6.add(sub2);
    const sub3 = this.updateActivityInstance.removeThis.subscribe(() => {
      this.removeElement.modelId = act.id;
      this.removeElement.type = 'node';
      this.removeItem();
    });
    this.subscription6.add(sub3);
    const sub4 = this.updateActivityInstance.createDeleteListeners.subscribe(() => this.createDeleteListeners());
    this.subscription6.add(sub4);
    const sub5 = this.updateActivityInstance.removeDeleteListeners.subscribe(() => this.removeDeleteListeners());
    this.subscription6.add(sub5);
    const sub6 = this.updateActivityInstance.updateExperience.subscribe(() => this.updateExperience(this.experience));
    this.subscription6.add(sub6);
    this.cd.detectChanges();

    this.activityMenuOpen = act.id;
  }

  closeUpdateActivityMenuConfirmation() {
    if (this.updateActivityInstance != null) {
      if (this.updateActivityInstance.checkChangesToSave()) {
        if (!this.alertConfirmOpen) {
          this.presentCloseActivityAlert();
        }
      } else {
        /*if (this.showUpdateMenu) {
          this.showHideMenu();
        }*/
        this.closeUpdateMenu();
      }

    }
  }

  closeUpdateMenu() {
    if (this.experienceMenuOpen) {
      return;
    } else {
      this.updateActivityInstance = null;
    }
    this.subscription6.unsubscribe();
    this.subscription6 = new Subscription();
    this.removeSelection();
    this.openUpdateExperienceMenu();
    this.cd.detectChanges();
  }

  openUpdateExperienceMenu() {

    if (this.experienceMenuOpen) {
      return;
    }
    this.removeComponent();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.updateExperienceComponentClass);
    const component = this.viewContainer.createComponent(componentFactory);
    const instance = component.instance;
    instance.experience = this.experience;
    const sub = instance.saveForm.subscribe((newExperience) => this.updateExperience(newExperience));
    this.subscription6.add(sub);
    const sub2 = instance.createDeleteListeners.subscribe(() => this.createDeleteListeners());
    this.subscription6.add(sub2);
    const sub3 = instance.removeDeleteListeners.subscribe(() => this.removeDeleteListeners());
    this.subscription6.add(sub3);
    this.experienceMenuOpen = true;
    this.cd.detectChanges();
  }

  openUpdateConnectionMenu(connection: core.ConnectionModel) {
    if (this.connectionMenuOpen === connection.id) {
      return;
    }
    if (!this.showUpdateMenu) {
      this.showHideMenu();
    }
    this.selectEdge(this.cy.$id(connection.edgeId));
    this.removeComponent();
    let activitySource: core.ActivityModel;
    this.st.pipe(select(store.getActivityById(connection.sourceId), take(1))).subscribe(value => activitySource = value);
    let activityTarget: core.ActivityModel;
    this.st.pipe(select(store.getActivityById(connection.targetId), take(1))).subscribe(value => activityTarget = value);
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.updateConnectionComponentClass);
    const component = this.viewContainer.createComponent(componentFactory);

    const instance = component.instance;
    instance.connection = connection;
    instance.activitySource = activitySource;
    instance.activityTarget = activityTarget;

    const sub = instance.removeThis.subscribe(() => {
      this.removeElement.modelId = connection.id;
      this.removeElement.type = 'edge';
      this.removeItem();
    });
    this.subscription6.add(sub);
    this.cd.detectChanges();

    this.connectionMenuOpen = connection.id;
  }

  removeItem() {
    if (!this.alertConfirmOpen && this.removeElement.modelId != null) {
      this.presentAlertConfirm();
    }
  }

  updateExperience(newExperience: core.ExperienceModel) {
    let activities;
    this.st.pipe(select(store.getAllActivities), take(1)).subscribe(value => activities = value);
    let connections;
    this.st.pipe(select(store.getConnectionsFromExperienceActive()), take(1)).subscribe(value => connections = value);
    const experience: core.ExperienceModel = Object.assign({}, newExperience);
    experience.activities = activities;
    experience.connections = connections;
    this.st.dispatch(new store.UpdateExperience(experience));
    this.experience = experience;
  }



  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Warning!',
      message: 'Do you want to delete the selected element?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'cancelBtn alertBtn',
          handler: () => {
            this.alertConfirmOpen = false;
          }
        }, {
          text: 'Confirm',
          cssClass: 'confirmBtn alertBtn',
          handler: () => {
            this.alertConfirmOpen = false;
            this.deleteActivityOrConnection();
          }
        }
      ]
    });
    this.alertConfirmOpen = true;
    await alert.present();
  }

  async presentCloseActivityAlert() {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: 'Do you want to close the activity without saving? Any changes made will be lost!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'cancelBtn alertBtn',
          handler: () => {
            this.alertConfirmOpen = false;
          }
        }, {
          text: 'Confirm',
          cssClass: 'confirmBtn alertBtn',
          handler: () => {
            this.alertConfirmOpen = false;
            /*if (this.showUpdateMenu) {
              this.showHideMenu();
            }*/
            this.closeUpdateMenu();
          }
        }
      ]
    });
    this.alertConfirmOpen = true;
    await alert.present();
  }


  ngAfterViewInit() {
    this.mapView = false;
    this.cd.detectChanges();
    this.startMapView();
  }


  createActivityOnEventPositionByDrag(event) {
    const rectDropzone = interact.getElementRect(event.target);
    if (this.endRect == null) {
      return;
    }
    const topDiff = (this.endRect.top - rectDropzone.top + this.endRect.height / 2);
    const leftDiff = (this.endRect.left - rectDropzone.left + this.endRect.width / 2);
    this.endRect = null;

    const newCoordinates =
      this.map.containerPointToLatLng([leftDiff, topDiff]);
    this.addActivity(newCoordinates.lat, newCoordinates.lng);
  }

  createActivityOnEventPositionByClick(event) {
    const x = event.renderedPosition.x;
    const y = event.renderedPosition.y;
    const newCoordinates =
      this.map.containerPointToLatLng([x, y]);
    this.addActivity(newCoordinates.lat, newCoordinates.lng);
  }

  selectEdge(edge) {
    // this.cy.$id(id).addClass('selected');
    this.removeElement.modelId = edge.data('connId');
    this.removeElement.type = 'edge';
    this.createDeleteListeners();


    this.cy.batch(() => {
      this.cy.elements().filter('[id != "' + edge.data('id') + '"]')
        .removeClass('selected')
        ;
    });
  }
  selectNode(node) {
    this.removeElement.modelId = node.data('activity').id;
    this.removeElement.type = 'node';
    this.createDeleteListeners();
    node.addClass('selected');
    this.cy.batch(() => {
      this.cy.elements().filter('[id != "' + node.data('activity').id + '"]')
        .removeClass('selected')
        ;
    });

  }

  removeSelection() {
    this.cy.batch(() => {
      this.cy.elements()
        .removeClass('selected');
    });
  }

  removeComponent() {
    // Find the component
    if (this.viewContainer.length > 0) {
      // Remove component from both view and array
      this.viewContainer.remove(0);
      this.experienceMenuOpen = false;
      this.activityMenuOpen = null;
      this.connectionMenuOpen = null;
    }
  }

  async startLocation() {
    await this.platform.ready();
    this.map.locate({
      setView: false,
      enableHighAccuracy: true
    });
  }

  private initMap(): void {

    const curZoom = 15;

    this.map = L.map('map', {
      loadingControl: true,
      center: [41.1096614, -8.615795],
      zoom: curZoom,
      dragging: true,
      tap: !L.Browser.mobile
    });

    this.map.setMaxBounds([[-90, -180], [90, 180]]);

    this.map.options.inertiaMaxSpeed = 0;
    this.map.options.zoomSnap = 1;
    this.map.options.zoomDelta = 1;
    this.map.options.maxBoundsViscosity = 1;
    this.map.options.doubleClickZoom = 'center';

    this.expandMap = true;


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

    this.map.setView([41.1096614, -8.615795], curZoom);

    this.startLocation();

    this.map.on('locationfound', (e) => {
      // this.toastService.presentToast(`Localização atualizada`, 'success');
      this.map.setView(e.latlng, curZoom);
      this.setNodesMapPositioned();
      let first = true;
      this.map.off('moveend');
      this.map.on('moveend', () => {
        if (this.platform.is('desktop')) {
          this.map.off('moveend');
        } else {
          this.map.invalidateSize();
        }


        if (first) {
          this.setNodesMapPositioned();
          first = false;
        }

        console.log('MOVEEND');
        // this.map.off('moveend');
      });


    });

    this.map.on('locationerror', (e) => {
      this.toastService.presentToast(`Error getting user location`, 'danger');
    });
    console.log('INIT MAP');
    setTimeout(() => { this.resizeMap(); }, 100);

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
          tooltip: 'Center on my location'
        },
      },
      addHooks: () => {
        this.map.locate({
          setView: false,
          enableHighAccuracy: true
        });
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
      if (this.removeElement.modelId != null) {
        this.createDeleteListeners();
      }
      for (let i = data.results.length - 1; i >= 0; i--) {
        this.map.setView(data.results[i].latlng, curZoom);
      }
    });

    searchControl.getContainer().onclick = e => {
      this.removeDeleteListeners();
    };

  }

  setListenersMap() {
    // console.log(this.map.getBounds().getSouthWest(), this.map.getCenter());
    // this.setNodesMapPositioned();

    this.map.on('zoomend', (e) => {
      // console.log('MOVEEND');
      this.setNodesMapPositioned();
    });
  }


  setNodesMapPositioned() {
    this.cy.nodes().forEach(ele => {
      if (ele.data('activity') != null) {
        const point = this.map.latLngToContainerPoint([ele.data('activity').lat, ele.data('activity').lng]);
        const newPos = { x: point.x, y: point.y };
        this.cy.$id(ele.data('id')).renderedPosition(newPos);
      }
    });
  }

  getCanvasPositionFromCoordinates(lat: number, lng: number) {
    return this.map.latLngToContainerPoint([lat, lng]);
  }

  mapEnable() {
    this.map.dragging.enable();
    this.map.touchZoom.enable();
    this.map.doubleClickZoom.enable();
    this.map.scrollWheelZoom.enable();
    this.map.boxZoom.enable();
    this.map.keyboard.enable();
  }

  mapDisable() {
    this.map.dragging.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
  }

  setCyListeners() {
    if (!this.mapView) {
      this.cy.on('grab', (event) => {
        const evtTarget = event.target;
        if (evtTarget.isNode() || evtTarget.isEdge()) {
          this.mapDisable();

        }
      });

      this.cy.on('free', (event) => {
        this.mapEnable();
      });

      this.cy.on('taphold', (event) => {
        const evtTarget = event.target;

        if (evtTarget !== this.cy) {
          if (evtTarget.isEdge()) {
            this.mapDisable();
          }
        } else {
          this.mapEnable();
        }
      });

      this.cy.on('tapend', (event) => {
        const evtTarget = event.target;
        if (evtTarget !== this.cy) {
          this.mapEnable();
        }
      });

      this.cy.on('dragfree', (event) => {
        const evtTarget = event.target;
        if (evtTarget.isNode()) {
          const newCoordinates = this.map.containerPointToLatLng([evtTarget.renderedPosition().x, evtTarget.renderedPosition().y]);
          this.updateActivityCoordinates(newCoordinates.lat, newCoordinates.lng, parseInt(evtTarget.data('activity').id, 10));
        }
      });
    }

    this.cy.on('tap', (event) => {
      const evtTarget = event.target;
      if (evtTarget === this.cy) {
        if (!this.mapView) {
          this.mapEnable();
        }

        this.removeElement = { modelId: null, type: null };
        this.removeDeleteListeners();
        if (this.clickedActivityBtn) {
          this.createActivityOnEventPositionByClick(event);
          this.clickedActivityBtn = false;
        } else {
          this.removeSelection();
          if (this.updateActivityInstance != null) {
            this.closeUpdateActivityMenuConfirmation();
          } else {
            /*if (this.showUpdateMenu) {
              this.showHideMenu();
            }*/
            if (this.connectionMenuOpen != null) {
              this.closeUpdateMenu();
            }
          }
        }
        this.cd.detectChanges();

      } else if (evtTarget.isNode()) {
        if (evtTarget.data('activity') != null) {
          this.openUpdateActivityMenu(evtTarget.data('activity'));
        }
      } else if (evtTarget.isEdge()) {
        this.openUpdateConnectionMenu(evtTarget.data('connection'));

      }
    });


    this.cy.on('ehcomplete', (event, sourceNode, targetNode, addedEles) => {
      if (!this.checkEdgeAlreadyExists(addedEles[0].data().source, addedEles[0].data().target)) {
        const newEdgeId = addedEles[0].data().id;
        let newConnectionId;
        this.st.pipe(select(store.getConnectionsNewId()), take(1)).subscribe(value => newConnectionId = value);
        const newConnection = new core.ConnectionModel(parseInt(addedEles[0].data().source, 10),
          parseInt(addedEles[0].data().target, 10),
          newEdgeId, newConnectionId);
        this.st.dispatch(new store.AddConnection(newConnection, false, false));
        this.toastService.presentToast(`Connection created`, 'success');
      } else {
        this.cy.remove(addedEles);
        this.toastService.presentToast(`Connection already exists`, 'warning');
      }

    });
  }

  checkEdgeAlreadyExists(source, target) {
    let counter = 0;
    for (const edge of this.cy.edges()) {
      if (edge.data('source') === source && edge.data('target') === target) {
        counter++;
        if (counter > 1) {
          return true;
        }
      }
    }

    return false;
  }

  changeView() {
    if (!this.mapView) {
      if (this.map == null) {
        this.destroyCy();
        this.mapParent.nativeElement.appendChild(this.dropzone.nativeElement);
        this.startMapView();
        this.activityCreate.nativeElement.className = this.activityCreate.nativeElement.className.replace('disabledDiv', '');
        this.activitySelect.nativeElement.className =
          this.activitySelect.nativeElement.className.replace('disabledDiv', '');
      }
    } else {
      this.startCanvasView();
      this.activityCreate.nativeElement.classList.add('disabledDiv');
      this.activitySelect.nativeElement.classList.add('disabledDiv');
    }
    // this.mapView = !this.mapView;
  }

  changeViewWithButtons($value) {
    this.mapView = $value;
  }

  startMapView() {
    // this.showHideMenu(false);
    this.subscription2 = new Subscription();
    this.initMap();
    // this.showHideMenu(true);


    this.subscription7 = new Subscription();

    this.createSizesListener();

    this.setCytoscape();


    this.setCyListeners();
    this.openUpdateExperienceMenu();

    this.setActivitiesSubMap();
    this.setConnectionsSub();

    this.setListenersMap();
    this.createActivityClickSub();
    this.setEhDefaults();
    this.setCxtMenuNodesMap();
    this.setCxtMenuEdges();

    this.setInteract();
  }

  startCanvasView() {
    this.destroyMap();
    this.destroyCy();

    this.mapParent.nativeElement.appendChild(this.dropzone.nativeElement);
    this.subscription7 = new Subscription();

    this.setCytoscape();

    this.cy.zoom(1);
    this.cy.minZoom(0.5);
    this.cy.maxZoom(3);

    this.subscription2.unsubscribe();
    this.setCyListeners();
    // this.openUpdateExperienceMenu();

    this.setActivitiesSubCanvas();
    this.setConnectionsSub();
    this.setEhDefaults();
    this.setCxtMenuNodesCanvas();
    this.setCxtMenuEdges();
  }

  destroyMap() {
    if (this.map != null) {
      this.map.eachLayer((layer) => { this.map.removeLayer(layer); });
      this.map.off();
      this.map.remove();
      this.map = null;
    }

  }

  destroyCy() {
    interact('.draggable-module').unset();
    interact('#map').unset();

    this.eh.destroy();
    this.cxtMenuNodes.destroy();
    this.cxtMenuEdges.destroy();

    this.cy.destroy();

    this.subscription7.unsubscribe();


  }

  makeSvg(element) {

    const pinColor = element.data().activity.pinColor;
    const hex = pinColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const color = 'rgb(' + r + ',' + g + ',' + b + ')';

    let secondPart;

    const firstPart = '<svg width="96" height="144" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M48 0C21.53 0 0 22.61 0 50.4C0 88.2 48 144 48 144C48 144 96 88.2 96 50.4C96 22.61 74.47 0 48 0Z" fill="white"/>' +
      '<path d="M48 6C24.2873 6 5 26.2548 5 51.15C5 85.0125 48 135 48 135C48 135 91 85.0125 91 51.15C91 26.2548 71.7127 6 48 6Z" fill="';

    switch (element.data().state) {
      case 'start':
        secondPart = '"/><path d="M29.39 20.14V84.14L77.39 52.15L29.39 20.14Z" fill="white"/></svg>';
        break;
      case 'end':
        secondPart = '"/><path d="M55.08 29.7299L53.8 22.2H25V86.1999H31.4V59.84H49.32L50.6 67.37H73V29.7299H55.08Z" fill="white"/></svg>';
        break;
      case 'startEnd':
        // tslint:disable-next-line:max-line-length
        secondPart = '"/><path d="M67.316 31C63.0335 31 58.9889 32.6654 56.1041 35.5502L35.197 54.1078C33.2937 56.0112 30.7658 57.052 28.0595 57.052C22.4981 57.052 17.9777 52.5613 17.9777 47C17.9777 41.4387 22.4981 36.948 28.0595 36.948C30.7658 36.948 33.2937 37.9888 35.316 40.0112L38.6766 42.9851L43.1673 39L39.4201 35.6989C36.3866 32.6654 32.342 31 28.0595 31C19.197 31 12 38.197 12 47C12 55.803 19.197 63 28.0595 63C32.342 63 36.3866 61.3346 39.2714 58.4498L52.1784 47L60.1784 39.8922C62.0818 37.9888 64.6097 36.948 67.316 36.948C72.8773 36.948 77.3978 41.4387 77.3978 47C77.3978 52.5613 72.8773 57.052 67.316 57.052C64.6394 57.052 62.0818 56.0112 60.0595 53.9888L56.6692 50.9851L52.1784 54.9703L55.9554 58.3011C58.9889 61.3048 63.0037 62.9703 67.316 62.9703C76.1784 62.9703 83.3755 55.803 83.3755 46.9703C83.3755 38.1375 76.1784 31 67.316 31V31Z" fill="white"/></svg>';
        break;
      default:
        // tslint:disable-next-line:max-line-length
        secondPart = '"/><path d="M48 69.48C43.2533 69.48 38.6131 68.0724 34.6663 65.4353C30.7195 62.7981 27.6434 59.0498 25.8269 54.6644C24.0104 50.279 23.5351 45.4534 24.4612 40.7978C25.3872 36.1423 27.673 31.8659 31.0294 28.5094C34.3859 25.153 38.6623 22.8672 43.3178 21.9411C47.9734 21.0151 52.799 21.4904 57.1844 23.3069C61.5698 25.1234 65.3181 28.1995 67.9553 32.1463C70.5924 36.0931 72 40.7332 72 45.48C72 51.8452 69.4715 57.9497 64.9706 62.4506C60.4697 66.9514 54.3652 69.48 48 69.48Z" fill="white"/></svg>';
        break;
    }


    return encodeURI('data:image/svg+xml;utf-8,' + firstPart + color + secondPart);
  }

  setCytoscape() {

    this.cy = cytoscape({
      container: this.dropzone.nativeElement, // container to render in

      elements: {
        nodes: [ // list of graph elements to start with
        ],
        edges: [
        ]
      },

      style: [ // the stylesheet for the graph

        {
          selector: 'node[activity]',
          style: {
            'background-color': 'data(activity.pinColor)',
            'background-opacity': 0,
            'background-image': (ele) => this.makeSvg(ele),
            'background-fit': 'contain',
            shape: 'hexagon',
            label: 'data(activity.title)',
            'font-size': '20px',
            color: '#04004d',
            'font-weight': 'bold',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.7,
            'text-background-padding': '8px',
            'text-margin-y': -9,
            'text-max-width': '1000px',
            'text-wrap': 'wrap',
            width: 64,
            height: 64,
          }
        },

        {
          selector: 'edge',
          style: {
            'line-color': '#04004d',
            'target-arrow-color': '#04004d',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle'
          }
        },

        // some style for the extension

        {
          selector: '.eh-handle',
          style: {
            'background-color': 'red',
            width: 24,
            height: 24,
            shape: 'roundrectangle',
            'overlay-opacity': 0,
            'border-width': 12, // makes the handle easier to hit
            'border-opacity': 0,
            label: ''
          }
        },

        {
          selector: '.eh-hover',
          style: {
            'background-color': 'red',
          }
        },
        {
          selector: '.eh-ghost',
          style: {
            label: ''
          }
        },

        {
          selector: '.eh-source',
          style: {
            'border-width': 2,
            'border-color': 'red'
          }
        },

        {
          selector: '.eh-target',
          style: {
            'border-width': 2,
            'border-color': 'red'
          }
        },

        {
          selector: '.eh-preview, .eh-ghost-edge',
          style: {
            'background-color': 'red',
            'line-color': 'red',
            'target-arrow-color': 'red',
            'source-arrow-color': 'red'
          }
        },

        {
          selector: '.eh-ghost-edge.eh-preview-active',
          style: {
            opacity: 0
          }
        },
        {
          selector: 'node.selected',
          style: {
            width: 96,
            height: 96,
          }
        },

      ],

      maxZoom: 0.7,
      minZoom: 0.7,
      zoom: 0.7,
      // panningEnabled: false,

      layout: {
        name: 'preset',
      },

    });
  }

  setActivitiesSubMap() {
    this.activitiesSub = this.activities$.subscribe(acts => {
      this.activities = acts as core.ActivityModel[];
      const nodes = [];
      const nodesIds = [];
      const sameNodesIds = [];
      const newNodesIds = [];
      this.cy.nodes().map((ele) => {
        nodesIds.push(ele.data('id'));
      });


      this.activities.forEach(act => {
        const newId = '' + act.id;

        if (this.cy.$id(newId).length === 0) {
          const newPos = this.getCanvasPositionFromCoordinates(act.lat, act.lng);
          let sta = 'common';
          if (act.startActivity && act.finalActivity) {
            sta = 'startEnd';
          } else if (act.startActivity) {
            sta = 'start';
          } else if (act.finalActivity) {
            sta = 'end';
          }
          let newNode = {};
          newNode = {
            data: { id: newId, activity: act, state: sta },
            rendered: newPos
          };
          newNodesIds.push(newId);
          nodes.push(newNode);
        } else {
          sameNodesIds.push(newId);
          if (this.cy.$id(newId).data('activity').lat !== act.lat && this.cy.$id(newId).data('activity').lng !== act.lng) {
            const newPos = this.getCanvasPositionFromCoordinates(act.lat, act.lng);
            this.cy.$id(newId).position(newPos);

          }
          this.cy.$id(newId).data('activity', act);

          let sta = 'common';
          if (act.startActivity && act.finalActivity) {
            sta = 'startEnd';
          } else if (act.startActivity) {
            sta = 'start';
          } else if (act.finalActivity) {
            sta = 'end';
          }
          this.cy.$id(newId).data('state', sta);

        }
      });

      const difference = nodesIds.filter(x => !sameNodesIds.includes(x));
      if (difference.length !== 0) {
        difference.forEach(n => {
          const ele = this.cy.$id(n);
          this.cy.remove(ele);
        });
      }


      if (newNodesIds.length !== 0) {
        this.cy.add(nodes);
      }
      const nodesLength = this.cy.nodes().length;
      if (newNodesIds.length === 1) {
        const targetNode = this.cy.nodes()[nodesLength - 1];

        this.setActivityCreatedConnections(targetNode, nodesLength);
      }

      this.setNodesMapPositioned();
      // cy.fit();
    });

    this.subscription7.add(this.activitiesSub);
  }

  createConnectionToLast(targetNode, sourceNode, second?: boolean) {
    let removedConnections: core.ConnectionModel[];
    // tslint:disable-next-line:max-line-length
    this.st.pipe(select(store.getConnectionsFromActivity(parseInt(targetNode.data('id'), 10))), take(1)).subscribe(value => removedConnections = value);
    if (removedConnections.length === 0 || (this.setCreated != null && this.setCounter === 2)) {
      const newEdgeId = 'edge_s_' + sourceNode.data('id') + '_t_' + targetNode.data('id');
      let newConnectionId;
      this.st.pipe(select(store.getConnectionsNewId()), take(1)).subscribe(value => newConnectionId = value);
      if (second) {
        newConnectionId++;
      }
      const newConnection = new core.ConnectionModel(parseInt(sourceNode.data('id'), 10), parseInt(targetNode.data('id'), 10),
        newEdgeId, newConnectionId);
      this.st.dispatch(new store.AddConnection(newConnection, true, true));
      this.toastService.presentToast(`Connection created`, 'success');
    } else {
      this.st.dispatch(new store.UpdateConnection(removedConnections[0], false, false));
      console.log('UPDATED CONNECTION');
    }
  }

  setActivityCreatedConnections(targetNode, nodesLength) {

    if (this.setCreated != null) {
      let sourceNode;
      switch (this.setCreated) {
        case this.activitiesSets[0]:
          if (this.setCounter === 0) {
            if (nodesLength <= 1) {
              break;
            }
          }

          sourceNode = this.cy.nodes()[nodesLength - 2];
          this.createConnectionToLast(targetNode, sourceNode);
          break;
        case this.activitiesSets[1]:
          if (this.setCounter === 0) {
            if (nodesLength > 1) {
              sourceNode = this.cy.nodes()[nodesLength - 2];
              this.createConnectionToLast(targetNode, sourceNode);
            }
          } else {
            sourceNode = this.cy.nodes()[nodesLength - 1 - this.setCounter];
            this.createConnectionToLast(targetNode, sourceNode);

          }
          break;
        case this.activitiesSets[2]:
          if (this.setCounter === 0) {
            if (nodesLength > 1) {
              sourceNode = this.cy.nodes()[nodesLength - 2];
              this.createConnectionToLast(targetNode, sourceNode);
            }
          } else {
            sourceNode = this.cy.nodes()[nodesLength - 2];
            this.createConnectionToLast(targetNode, sourceNode);
            if (this.setCounter === 2) {
              const newTarget = this.cy.nodes()[nodesLength - 3];
              sourceNode = this.cy.nodes()[nodesLength - 1];
              this.createConnectionToLast(newTarget, sourceNode, true);
            }

          }
          break;
        case this.activitiesSets[3]:
          break;
        default:
          break;
      }

      if (this.setCounter === 2) {
        this.setCounter = null;
        this.setCreated = null;
      } else {
        this.setCounter++;
      }


    } else {
      if (nodesLength > 1) {
        const sourceNode = this.cy.nodes()[nodesLength - 2];
        this.createConnectionToLast(targetNode, sourceNode);
      }
    }


    // this.openUpdateActivityMenu(targetNode.data('activity'));
    this.closeUpdateMenu();
    if (this.recentlyCreatedNode != null) {
      this.selectNode(targetNode);
      this.recentlyCreatedNode = null;
      this.openUpdateActivityMenu(targetNode.data('activity'));
    }

    this.cd.detectChanges();
  }

  setActivitiesSubCanvas() {
    this.activitiesSub = this.activities$.subscribe(acts => {
      this.activities = acts as core.ActivityModel[];
      const nodes = [];
      const nodesIds = [];
      const sameNodesIds = [];
      const newNodesIds = [];
      this.cy.nodes().map((ele) => {
        nodesIds.push(ele.data('id'));
      });

      // let xPos = 50;
      // let yPos = 50;

      this.activities.forEach(act => {
        const newId = '' + act.id;

        if (this.cy.$id(newId).length === 0) {
          // xPos += 20;
          // yPos += 20;
          let sta = 'common';
          if (act.startActivity && act.finalActivity) {
            sta = 'startEnd';
          } else if (act.startActivity) {
            sta = 'start';
          } else if (act.finalActivity) {
            sta = 'end';
          }
          let newNode = {};
          newNode = {
            data: { id: newId, activity: act, state: sta },
            position: { x: 0, y: 0 }
          };
          newNodesIds.push(newId);
          nodes.push(newNode);
        } else {
          sameNodesIds.push(newId);
          this.cy.$id(newId).data('activity', act);

          let sta = 'common';
          if (act.startActivity && act.finalActivity) {
            sta = 'startEnd';
          } else if (act.startActivity) {
            sta = 'start';
          } else if (act.finalActivity) {
            sta = 'end';
          }
          this.cy.$id(newId).data('state', sta);

        }
      });

      const difference = nodesIds.filter(x => !sameNodesIds.includes(x));
      if (difference.length !== 0) {
        difference.forEach(n => {
          const ele = this.cy.$id(n);
          this.cy.remove(ele);
        });
      }


      if (newNodesIds.length !== 0) {
        this.cy.add(nodes);
      }
      const nodesLength = this.cy.nodes().length;
      if (newNodesIds.length === 1) {
        const targetNode = this.cy.nodes()[nodesLength - 1];
        this.setActivityCreatedConnections(targetNode, nodesLength);

      }
      // console.log(acts);
      this.setNodesCanvasPositioned();
      // cy.fit();
    });

    this.subscription7.add(this.activitiesSub);
  }

  setNodesCanvasPositioned() {
    this.positionedNodes = {};
    const activitiesWithoutSource = [];
    let activities;
    this.st.pipe(select(store.getAllActivities), take(1)).subscribe(value => activities = value);

    activities.forEach(act => {
      let connections;
      this.st.pipe(select(store.getConnectionsFromActivityAsTarget(act.id)), take(1)).subscribe(value => connections = value);
      if (act.startActivity === false && connections.length === 0) {
        activitiesWithoutSource.push(act);
      }
    });



    let startActivity: core.ActivityModel;
    this.st.pipe(select(store.getStartActivity()), take(1)).subscribe(value => startActivity = value);
    if (startActivity == null) {

      const xPos = 100;
      let yPos = 100;

      activitiesWithoutSource.forEach(act => {

        yPos = this.recursivePosition(act, xPos, yPos);
        yPos += 100;
      });

      this.recursiveOtherActivities(activities, yPos);

    } else {
      const xPos = 100;
      let yPos = 100;

      yPos = this.recursivePosition(startActivity, xPos, yPos);

      yPos += 100;

      activitiesWithoutSource.forEach(act => {
        yPos = this.recursivePosition(act, xPos, yPos);
        yPos += 100;
      });

      this.recursiveOtherActivities(activities, yPos);

    }
  }

  recursivePosition(newActivity: core.ActivityModel, xPos: number, yN: number): number {
    const activityId = newActivity.id;
    let yPos = yN;

    let connectionsAsTarget;
    this.st.pipe(select(store.getConnectionsFromActivityAsTarget(activityId)), take(1)).subscribe(value => connectionsAsTarget = value);
    let flag = 0;
    let flag2 = 0;
    connectionsAsTarget.forEach(conn => {
      // if (!this.positionedNodes.includes(conn.sourceId)) {
      //   if (flag === 1) {
      //     yPos += 100;
      //     return;
      //   }
      //   flag = 1;
      // }
      if (Object.keys(this.positionedNodes).includes('' + conn.sourceId)) {
        if (flag2 === 1 && this.positionedNodes[conn.sourceId] === yPos) {
          yPos += 100;
          flag2 = 2;
          return;
        }
        flag2 = 1;
      }
    });

    let connections: core.ConnectionModel[];
    this.st.pipe(select(store.getConnectionsFromActivityAsSource(activityId)), take(1)).subscribe(value => connections = value);

    // console.log(connections);

    connections.forEach(conn => {
      if (flag2 !== 2 && Object.keys(this.positionedNodes).length !== 0 &&
        conn.targetId !== this.positionedNodes[Object.keys(this.positionedNodes)[Object.keys(this.positionedNodes).length - 1]] &&
        Object.keys(this.positionedNodes).includes(conn.targetId + '') &&
        this.positionedNodes[conn.targetId] === yPos) {
        yPos += 100;
        flag = 1;
        return;
      }
    });
    // if (connections.length !== 0) {
    //   console.log(connections[0].targetId, this.positionedNodes[this.positionedNodes.length - 1]);
    //   if (flag2 !== 2 && this.positionedNodes.length !== 0 &&
    //     connections[0].targetId !== this.positionedNodes[this.positionedNodes.length - 1]) {
    //     yPos += 100;
    //   }
    // }

    this.positionedNodes[activityId] = yPos;
    const pos = { x: xPos, y: yPos };
    this.cy.$id('' + activityId).position(pos);


    if (connections.length === 0) {
      return yPos;
    }

    xPos += 150;
    let activity;
    let yMax = yPos;
    connections.forEach(conn => {
      const targetId = conn.targetId;
      if (!Object.keys(this.positionedNodes).includes(targetId + '')) {


        this.st.pipe(select(store.getActivityById(targetId)), take(1)).subscribe(value => activity = value);
        const yT = this.recursivePosition(activity, xPos, yPos);
        yPos += 100;
        if (yT > yMax) {
          yMax = yT;
        }
      }



    });

    if (yPos > yMax) {
      yMax = yPos;
    }

    return yMax;
  }

  recursiveOtherActivities(allActivities: core.ActivityModel[], yPos) {
    const activities = [];

    allActivities.forEach(act => {
      if (!Object.keys(this.positionedNodes).includes(act.id + '')) {
        activities.push(act);
      }
    });


    if (activities.length > 0) {
      // let connections;
      // this.st.pipe(select(store.getConnectionsFromActivityAsTarget(activity.id)), take(1)).subscribe(value => connections = value);
      yPos = this.recursivePosition(activities[0], 100, yPos);
      yPos += 100;

      this.recursiveOtherActivities(allActivities, yPos);
    }
  }

  setConnectionsSub() {
    this.connectionsSub = this.connections$.subscribe(conns => {
      this.connections = conns as core.ConnectionModel[];
      const edges = [];
      const edgesIds = [];
      const sameEdgesIds = [];
      const newEdgesIds = [];


      this.cy.edges().map((ele) => {
        edgesIds.push(ele.data('id'));
      });

      this.connections.forEach(conn => {
        // console.log(conn);
        const newId = conn.edgeId;
        if (this.cy.$id(conn.sourceId).length !== 0 && this.cy.$id(conn.targetId).length !== 0) {
          if (this.cy.$id(newId).length === 0) {
            let newEdge = {};
            newEdge = {
              data: { id: conn.edgeId, source: conn.sourceId, target: conn.targetId, connId: conn.id, connection: conn },
            };
            newEdgesIds.push(newId);
            edges.push(newEdge);

          } else {
            sameEdgesIds.push(newId);
            if (this.cy.$id(newId).data('connId') == null) {
              this.cy.$id(newId).data('connId', conn.id);
              this.cy.$id(newId).data('connection', conn);
            }
          }
        }
      });


      const difference = edgesIds.filter(x => !sameEdgesIds.includes(x));

      if (difference.length !== 0) {
        difference.forEach(n => {
          const ele = this.cy.$id(n);
          this.cy.remove(ele);
        });
      }
      if (newEdgesIds.length !== 0) {
        this.cy.add(edges);
      }
    });

    this.subscription7.add(this.connectionsSub);
  }

  setEhDefaults() {
    const ehDefaults = {
      preview: true, // whether to show added edges preview before releasing selection
      hoverDelay: 150, // time spent hovering over a target node before it is considered selected
      handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
      snap: false, // when enabled, the edge can be drawn by just moving close to a target node
      snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
      snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
      noEdgeEventsInDraw: false, // set events:no to edges during draws, prevents mouseouts on compounds
      // tslint:disable-next-line:max-line-length
      disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
      handlePosition: (node) => {
        return 'middle top'; // sets the position of the handle in the format of "X-AXIS Y-AXIS" such as "left top", "middle top"
      },
      handleInDrawMode: true, // whether to show the handle in draw mode
      edgeType: (sourceNode, targetNode) => {
        // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
        // returning null/undefined means an edge can't be added between the two nodes
        return 'flat';
      },
      loopAllowed: (node) => {
        // for the specified node, return whether edges from itself to itself are allowed
        return false;
      },
      nodeLoopOffset: -50, // offset for edgeType: 'node' loops
      nodeParams: (sourceNode, targetNode) => {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for intermediary node
        return {};
      },
      edgeParams: (sourceNode, targetNode, i) => {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for edge
        // NB: i indicates edge index in case of edgeType: 'node'
        return {};
      },
      ghostEdgeParams: () => {
        // return element object to be passed to cy.add() for the ghost edge
        // (default classes are always added for you)
        return {};
      },
      show: (sourceNode) => {
        // fired when handle is shown
      },
      hide: (sourceNode) => {
        // fired when the handle is hidden
      },
      start: (sourceNode) => {
        // fired when edgehandles interaction starts (drag on handle)
        if (!this.mapView) {
          this.mapDisable();
        }
      },
      complete: (sourceNode, targetNode, addedEles) => {
        // fired when edgehandles is done and elements are added
      },
      stop: (sourceNode) => {
        // fired when edgehandles interaction is stopped (either complete with added edges or incomplete)
        if (!this.mapView) {
          this.mapEnable();
        }
      },
      cancel: (sourceNode, cancelledTargets) => {
        // fired when edgehandles are cancelled (incomplete gesture)
      },
      hoverover: (sourceNode, targetNode) => {
        // fired when a target is hovered
      },
      hoverout: (sourceNode, targetNode) => {
        // fired when a target isn't hovered anymore
      },
      previewon: (sourceNode, targetNode, previewEles) => {
        // fired when preview is shown
      },
      previewoff: (sourceNode, targetNode, previewEles) => {
        // fired when preview is hidden
      },
      drawon: () => {
        // fired when draw mode enabled
      },
      drawoff: () => {
        // fired when draw mode disabled
      }
    };



    this.eh = this.cy.edgehandles(ehDefaults);
    this.eh.disableDrawMode();
  }

  setCxtMenuNodesMap() {
    const cxtMenuDefaults = {
      menuRadius: 100, // the radius of the circular menu in pixels
      selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
      commands: [ // an array of commands to list in the menu or a function that returns the array
        {
          content: '<ion-icon class="cxtMenuIcon" name="create-sharp"></ion-icon>',
          contentStyle: { 'font-size': '32px' },
          select: (ele) => {
            const act: core.ActivityModel = ele.data('activity');
            if (act != null) {
              this.openUpdateActivityMenu(act);
            }
          }
        },

        {
          content: '<ion-icon class="cxtMenuIcon" name="trash-sharp"></ion-icon>',
          contentStyle: { 'font-size': '32px' },
          select: (ele) => {

            const act: core.ActivityModel = ele.data('activity');
            if (act != null) {
              this.removeElement.modelId = act.id;
              this.removeElement.type = 'node';
              this.removeItem();
            }
          },
        },

        {
          content: '<ion-icon class="cxtMenuIcon" name="duplicate-sharp"></ion-icon>',
          contentStyle: { 'font-size': '32px' },
          select: (ele) => {
            const act: core.ActivityModel = ele.data('activity');
            if (act != null) {
              const newCoordinates =
                this.map.containerPointToLatLng([ele.renderedPosition().x, ele.renderedPosition().y]);
              this.duplicateActivity(act, newCoordinates.lat + + 0.002, newCoordinates.lng + 0.002);
            }
          }
        }

      ], // function( ele ){ return [ ... ] }, // a function that returns commands or a promise of commands
      fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
      activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
      activePadding: 20, // additional size in pixels for the active command
      indicatorSize: 24, // the size in pixels of the pointer to the active command
      separatorWidth: 3, // the empty spacing in pixels between successive commands
      spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
      minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
      maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
      // tslint:disable-next-line:max-line-length
      openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
      itemColor: 'white', // the colour of text in the command's content
      itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
      zIndex: 9999, // the z-index of the ui div
      atMouse: false // draw menu at mouse position
    };

    this.cxtMenuNodes = this.cy.cxtmenu(cxtMenuDefaults);
  }

  setCxtMenuNodesCanvas() {
    const cxtMenuDefaults = {
      menuRadius: 100, // the radius of the circular menu in pixels
      selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
      commands: [ // an array of commands to list in the menu or a function that returns the array
        {
          content: '<ion-icon class="cxtMenuIcon" name="create-sharp"></ion-icon>',
          contentStyle: { 'font-size': '32px' },
          select: (ele) => {
            const act: core.ActivityModel = ele.data('activity');
            if (act != null) {
              this.openUpdateActivityMenu(act);
            }
          }
        },

        {
          content: '<ion-icon class="cxtMenuIcon" name="trash-sharp"></ion-icon>',
          contentStyle: { 'font-size': '32px' },
          select: (ele) => {

            const act: core.ActivityModel = ele.data('activity');
            if (act != null) {
              this.removeElement.modelId = act.id;
              this.removeElement.type = 'node';
              this.removeItem();
            }
          },
        },

      ], // function( ele ){ return [ ... ] }, // a function that returns commands or a promise of commands
      fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
      activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
      activePadding: 20, // additional size in pixels for the active command
      indicatorSize: 24, // the size in pixels of the pointer to the active command
      separatorWidth: 3, // the empty spacing in pixels between successive commands
      spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
      minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
      maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
      // tslint:disable-next-line:max-line-length
      openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
      itemColor: 'white', // the colour of text in the command's content
      itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
      zIndex: 9999, // the z-index of the ui div
      atMouse: false // draw menu at mouse position
    };

    this.cxtMenuNodes = this.cy.cxtmenu(cxtMenuDefaults);
  }

  setCxtMenuEdges() {
    const cxtMenuDefaults = {
      menuRadius: 100, // the radius of the circular menu in pixels
      selector: 'edge', // elements matching this Cytoscape.js selector will trigger cxtmenus
      commands: [ // an array of commands to list in the menu or a function that returns the array
        {
          content: '<ion-icon class="cxtMenuIcon" name="create-sharp"></ion-icon>',
          contentStyle: { 'font-size': '32px' },
          select: (ele) => {

            this.openUpdateConnectionMenu(ele.data('connection'));
            if (!this.mapView) {
              this.mapEnable();
            }

          }
        },

        {
          content: '<ion-icon class="cxtMenuIcon" name="trash-sharp"></ion-icon>',
          contentStyle: { 'font-size': '32px' },
          select: (ele) => {
            this.removeElement.modelId = this.cy.$id(ele.data('id')).data('connId');
            this.removeElement.type = 'edge';
            this.removeItem();
            if (!this.mapView) {
              this.mapEnable();
            }
          },
        },

        // { // example command
        //  fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
        // content: 'a command name' // html/text content to be displayed in the menu
        // contentStyle: {}, // css key:value pairs to set the command's css in js if you want
        // select: function(ele){ // a function to execute when the command is selected
        //  console.log( ele.id() ) // `ele` holds the reference to the active element
        // },
        // enabled: true // whether the command is selectable
        // }

      ], // function( ele ){ return [ ... ] }, // a function that returns commands or a promise of commands
      fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
      activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
      activePadding: 20, // additional size in pixels for the active command
      indicatorSize: 24, // the size in pixels of the pointer to the active command
      separatorWidth: 3, // the empty spacing in pixels between successive commands
      spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
      minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
      maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
      // tslint:disable-next-line:max-line-length
      openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
      itemColor: 'white', // the colour of text in the command's content
      itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
      zIndex: 9999, // the z-index of the ui div
      atMouse: false // draw menu at mouse position
    };
    this.cxtMenuEdges = this.cy.cxtmenu(cxtMenuDefaults);
  }

  setInteract() {
    interact('.draggable-module')
      .draggable({

        manualStart: true,
        // enable inertial throwing
        inertia: false,
        // keep the element within the area of it's parent
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: '#grid_drag',
            endOnly: false
          }),
        ],
        // enable autoScroll
        autoScroll: true,

        onstart(event) {
          clickOnActivityBtn(true);
          addCLassToActivityCreate();
        },

        // call this function on every dragmove event
        onmove: dragMoveListener,
        // call this function on every dragend event
        onend(event) {
          console.log('DROP');
          // clickOnActivityBtn();
          updateEndRect(event.target.getBoundingClientRect());
          removeCLassToActivityCreate();

          event.target.parentNode.removeChild(event.target);
        }
      }).on('move', (event) => {
        if (this.clickedActivityBtn) {
          return;
        }
        const interaction = event.interaction;
        // if the pointer was moved while being held down
        // and an interaction hasn't started yet
        if (interaction.pointerIsDown && !interaction.interacting() && event.currentTarget.classList.contains('drag-element-source')) {
          const clone = this.sourceIcon.el.cloneNode(true);



          // console.log(event.target, event.currentTarget);
          // const rectModules = interact.getElementRect(this.sourceIcon.nativeElement);
          const rectIcon = interact.getElementRect(this.sourceIcon.el);
          console.log(event.target.classList);
          let x = event.offsetX;
          let y = event.offsetY;

          if (event.target.classList.contains('spanActivity')) {
            x += rectIcon.width + 24;
            y += 10;
          } else if (!event.target.classList.contains('drag-element-source')) {
            y += 10;
            x += 8;
          }
          // const columnRect = interact.getElementRect(this.column.nativeElement);
          // const topDiff = rectModules.top;

          // const rectTarget = interact.getElementRect(event.target);
          // const rectModules = interact.getElementRect(this.sourceDiv.nativeElement);

          // const topDiff = rectTarget.top - rectModules.top;

          // console.log(event.currentTarget);
          // console.log(event.offsetY, rectIcon.height / 2);

          clone.className = clone.className.replace('drag-element-source', '');
          clone.style.top = y - rectIcon.height / 2 + 'px';
          clone.style.left = x - rectIcon.width / 2 + 'px';

          this.sourceDiv.nativeElement.appendChild(clone);

          // start a drag interaction targeting the clone
          interaction.start({ name: 'drag' },
            event.interactable,
            clone);
        } else {
          // console.log('ERROR DRAG');
        }
      });
    // .on('tap', (e) => {
    //   console.log('TAP');
    //   clickOnActivityBtn();
    // });

    interact('#map').dropzone({
      // only accept elements matching this CSS selector
      accept: '#module-drop',
      // Require a 75% element overlap for a drop to be possible
      overlap: 1,

      // listen for drop related events:

      ondropactivate(event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter(event) {
        const draggableElement = event.relatedTarget;
        const dropzoneElement = event.target;
        // console.log('DRAG ENTER');
        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
        // draggableElement.textContent = 'Dragged in';

      },
      ondragleave(event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        // event.relatedTarget.textContent = 'Dragged out';

      },
      ondrop(event) {
        clickOnActivityBtn(true);
        if (event.relatedTarget.classList.contains('draggable-module')) {
          callCreateActivityDrag(event);

        }

      },
      ondropdeactivate(event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
      }
    });

    const updateEndRect = (newRect) => { this.endRect = newRect; };
    const callCreateActivityDrag = (event) => this.createActivityOnEventPositionByDrag(event);
    const clickOnActivityBtn = (value) => { this.dragged = value; this.cd.detectChanges(); };
    const addCLassToActivityCreate = () => {
      this.activityCreate.nativeElement.classList.add('hoveredCreateActivity');
    };
    const removeCLassToActivityCreate = () => {
      this.activityCreate.nativeElement.classList.remove('hoveredCreateActivity');
    };

    function dragMoveListener(event) {

      if (event.target != null) {
        const target = event.target;
        // keep the dragged position in the data-x/data-y attributes
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform =
          target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';


        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      } else {
        console.log(event.target);
      }
    }
  }


  async previewExperience() {
    const modal = await this.modalController.create({
      component: PreviewExperienceModalComponent,
      cssClass: 'modalPreview',
    });
    modal.onDidDismiss()
      .then((result) => {
        if (result.role === 'confirm') {
          console.log('Finished Preview');
        } else {
          console.log('Stopped Preview');
        }
        // this.createDeleteListeners();
      });
    // this.removeDeleteListeners();
    return await modal.present();
  }

  showHideMenu(val?: boolean) {
    // console.log(this.showUpdateMenu);
    if (val != null) {
      if (this.showUpdateMenu === val) {
        return;
      }
      // this.showUpdateMenu = val;
      if (val) {
        if (this.rightMenu.nativeElement.classList.contains('rightMenuHide')) {
          this.rightMenu.nativeElement.className = this.rightMenu.nativeElement.className.replace('rightMenuHide', 'rightMenu');
        }

      } else {
        if (this.rightMenu.nativeElement.classList.contains('rightMenu')) {
          this.rightMenu.nativeElement.className = this.rightMenu.nativeElement.className.replace('rightMenu', 'rightMenuHide');
          this.rightMenu.nativeElement.style.width = 0;
          this.showUpdateMenu = val;
        }
        // this.rightMenu.nativeElement.style.width = 0;
      }
      // setTimeout(() => { this.resizeMap(); }, 500);
    } else {
      this.showUpdateMenu = !this.showUpdateMenu;
      if (this.rightMenu.nativeElement.clientWidth) {
        this.rightMenu.nativeElement.style.width = 0;
        if (this.expandMap) {
          if (!this.mapView) {
            setTimeout(() => { this.resizeMap(); }, 300);
          }
          this.expandMap = false;
        }

      } else {
        this.rightMenu.nativeElement.style.width = this.rightMenuWidth + 'px';
      }
    }

  }

  publishExperience() {
    const newExperience = Object.assign({}, this.experience);
    newExperience.published = true;
    this.st.dispatch(new store.UpdateExperience(newExperience));
    this.experience = newExperience;
    this.cd.detectChanges();
  }

  createActivitiesFromSet(set: string) {
    const mapRect = this.dropzone.nativeElement.getBoundingClientRect();
    const x = mapRect.width / 2;
    const y = mapRect.height / 2;
    this.setCreated = set;
    this.setCounter = 0;
    const newCoordinates =
      this.map.containerPointToLatLng([x, y]);
    let newActivityData;

    switch (set) {
      case this.activitiesSets[0]:
        this.addActivity(newCoordinates.lat, newCoordinates.lng - 0.002);
        newActivityData = { lat: newCoordinates.lat, lng: newCoordinates.lng };
        this.addActivity(newActivityData.lat, newActivityData.lng);
        newActivityData = { lat: newCoordinates.lat, lng: newCoordinates.lng + 0.002 };
        this.addActivity(newActivityData.lat, newActivityData.lng);
        break;
      case this.activitiesSets[1]:
        this.addActivity(newCoordinates.lat, newCoordinates.lng);
        newActivityData = { lat: newCoordinates.lat + 0.002, lng: newCoordinates.lng + 0.002 };
        this.addActivity(newActivityData.lat, newActivityData.lng);
        newActivityData = { lat: newCoordinates.lat - 0.002, lng: newCoordinates.lng + 0.002 };
        this.addActivity(newActivityData.lat, newActivityData.lng);
        break;
      case this.activitiesSets[2]:
      case this.activitiesSets[3]:
        this.addActivity(newCoordinates.lat, newCoordinates.lng);
        newActivityData = { lat: newCoordinates.lat - 0.002, lng: newCoordinates.lng + 0.002 };
        this.addActivity(newActivityData.lat, newActivityData.lng);
        newActivityData = { lat: newCoordinates.lat - 0.002, lng: newCoordinates.lng - 0.002 };
        this.addActivity(newActivityData.lat, newActivityData.lng);
        break;
      default:
        break;
    }
  }

}


