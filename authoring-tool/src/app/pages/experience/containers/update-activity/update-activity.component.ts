import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import * as store from './../../../experience/store';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as core from './../../../../core';
import * as actions from './../../store/actions';
import { ModuleComponent, ModuleConfigurationComponent, PreviewActivityComponent, MapModalComponent } from '../../components';
import { NavParams, ModalController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as ELG from 'esri-leaflet-geocoder';

import * as Underscore from 'underscore';
import { AngularFireStorage } from '@angular/fire/storage';
import { UploadFileService, ToastService } from './../../../../core';

@Component({
  selector: 'app-update-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './update-activity.component.html',
  styleUrls: ['./update-activity.component.scss'],
})
export class UpdateActivityComponent implements OnInit {
  @Output() closeForm: EventEmitter<any> = new EventEmitter();
  @Output() saveForm: EventEmitter<any> = new EventEmitter();
  @Output() removeThis: EventEmitter<any> = new EventEmitter();
  @Output() updateExperience: EventEmitter<any> = new EventEmitter();

  @Output() createDeleteListeners: EventEmitter<any> = new EventEmitter();
  @Output() removeDeleteListeners: EventEmitter<any> = new EventEmitter();

  @ViewChild(ModuleConfigurationComponent) moduleConfigComponent: ModuleConfigurationComponent;

  modules$: Observable<core.ModuleModel[]>;

  address: string;
  originalAddress: string;

  newCoordinates: any;

  tags: string;
  moduleData: any;
  moduleDataChange: boolean;
  moduleFilter: string;

  activities: core.ActivityModel[];
  selectedModuleId: string;
  selectedModule: core.ModuleModel;
  originalModule: core.ModuleModel;
  activity: core.ActivityModel;
  activityName: string;
  pinColor: string;
  coords: { lat: number, lng: number };

  numberOfConnectionsTarget: number;
  numberOfConnectionsSource: number;

  connectionsAsTarget: core.ConnectionModel[];
  connectionsAsSource: core.ConnectionModel[];

  objectKeys = Object.keys;
  finalConnectionsTarget: {};
  finalConnectionsSource: {};

  originalTargetIds: string[];
  originalSourceIds: string[];

  removedOriginalTargetConnections: {};
  removedOriginalSourceConnections: {};

  edgeIdLastConnectionTarget: string;
  edgeIdLastConnectionSource: string;

  targetIndexForCreation: number;
  sourceIndexForCreation: number;

  sourcesInUseForThisTarget: number[];
  targetsInUseForThisSource: number[];

  componentType: string;

  isStartsHereChecked: boolean;
  isEndsHereChecked: boolean;
  isColorForChildren: boolean;

  proximity: number;
  startHour: number;
  endHour: number;

  daysFormControl = new FormControl();

  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  activitesIdsAlreadyFilled: any[];

  resultAddresses: any[];

  loadingAddresses: boolean;
  firstSearch: boolean;
  query: string;

  gapi: any;

  testdata: any;
  files: {};

  changedConnection: boolean;

  constructor(
    private st: Store<store.DashboardState>,
    public cd: ChangeDetectorRef,
    public modalController: ModalController,
    private uploadFileService: UploadFileService,
    private toastService: ToastService) {
    this.selectedModule = null;
    this.originalModule = null;
  }

  ngOnInit() {
    this.activityName = this.activity.title;
    this.pinColor = this.activity.pinColor;
    this.selectedModuleId = this.activity.moduleId;
    this.tags = this.activity.tags;
    this.moduleData = this.activity.moduleData;
    this.isStartsHereChecked = this.activity.startActivity;
    this.isEndsHereChecked = this.activity.finalActivity;
    this.proximity = this.activity.proximity;
    this.startHour = this.activity.startHour;
    this.endHour = this.activity.endHour;
    this.coords = { lat: this.activity.lat, lng: this.activity.lng };
    this.daysFormControl.setValue(this.activity.days);
    if (this.selectedModuleId != null) {
      this.st.pipe(select(store.getModuleById(this.selectedModuleId)), take(1)).subscribe(value => this.selectedModule = value);
      this.st.pipe(select(store.getModuleById(this.selectedModuleId)), take(1)).subscribe(value => this.originalModule = value);

    }

    this.moduleDataChange = false;

    this.activitesIdsAlreadyFilled = [];

    this.isColorForChildren = false;

    this.originalTargetIds = [];
    this.originalSourceIds = [];
    this.removedOriginalTargetConnections = [];
    this.removedOriginalSourceConnections = [];
    this.finalConnectionsTarget = {};
    this.finalConnectionsSource = {};
    this.sourcesInUseForThisTarget = [];
    this.targetsInUseForThisSource = [];
    this.resultAddresses = [];

    this.changedConnection = false;

    this.loadingAddresses = false;
    this.firstSearch = false;
    this.query = '';

    this.configConnections();
    this.cd.detectChanges();
  }

  selectModule(module: core.ModuleModel) {
    this.selectedModuleId = module.id;
    this.selectedModule = module;
    if (this.selectedModuleId !== this.activity.moduleId) {
      this.moduleDataChange = true;
    } else {
      this.moduleDataChange = false;
    }
    if (this.moduleConfigComponent != null) {
      this.moduleConfigComponent.myFormGroup.reset();
      this.moduleConfigComponent.moduleConfig = this.selectedModule.htmlConfig;
      this.moduleConfigComponent.moduleDataChange = this.moduleDataChange;
      this.moduleConfigComponent.setModuleContent();
    }


    this.cd.detectChanges();
  }

  callCreateDelete() {
    this.createDeleteListeners.emit();
  }

  callRemoveDelete() {
    this.removeDeleteListeners.emit();
  }

  async uploadFiles(moduleData) {
    const newData = Object.assign({}, moduleData);
    this.testdata = newData;
    // console.log(this.files);

    const acts = this.objectKeys(this.files).map(this.uploadFi, this);
    await Promise.all(acts.map(this.handleRejection)).then(() => {
      // console.log('FINISHED');
    });

  }

  async uploadFi(fileLabel) {
    const file = this.files[fileLabel];
    let type;
    if (file.type.includes('image')) {
      type = 'images';
    } else if (file.type.includes('video')) {
      type = 'videos';
    } else {
      type = 'audios';
    }
    await this.uploadFileService.uploadFile(file, type);
    await this.uploadFileService.getUrl().then(() => this.testdata[fileLabel] = { url: this.uploadFileService.url, name: file.name });
  }

  handleRejection(p) {
    return p.catch((error) => ({
      error
    }));
  }

  async saveActivity() {
    if (this.selectedModule == null) {
      console.log('No module selected');
      this.toastService.presentToast(`No module selected! Please select a module.`, 'danger');
      return;
    }

    const oldActivity: core.ActivityModel = Object.assign({}, this.activity);
    const newActivity: core.ActivityModel = Object.assign({}, this.activity);

    if (this.moduleConfigComponent != null) {
      this.moduleConfigComponent.isSubmitted = true;
      this.moduleConfigComponent.cd.detectChanges();

      if (!this.moduleConfigComponent.validate()) {
        this.toastService.presentToast(`Module content not filled. Please fill at least one of the fields.`, 'danger');
        console.log('Module content not completed');
        return;
      }

      if (!this.moduleConfigComponent.validateLocationsImgs()) {
        this.toastService.presentToast(
          `Images fields and locations fields filled don't match. Please fill corresponding images and locations.`, 'danger');
        console.log('Locations and images don\'t match');
        return;
      }

      this.files = { ...this.moduleConfigComponent.images, ...this.moduleConfigComponent.videos, ...this.moduleConfigComponent.audios };

      if (this.moduleDataChange) {
        if (this.originalModule != null && this.moduleData != null) {
          this.originalModule.htmlConfig.forEach(data => {
            if (this.moduleData[data.label]) {
              if (data.type === 'image' || data.type === 'video' || data.type === 'audio') {
                // console.log('delete ' + data.label);
                // console.log(this.moduleData[data.label].url);
                // this.uploadFileService.deleteFile(this.moduleData[data.label].url);
              }
            }
          });
        }
      } else {
        if (this.moduleData != null) {
          this.objectKeys(this.files).forEach(label => {
            if (this.moduleData[label]) {
              // console.log('delete ' + label);
              // this.uploadFileService.deleteFile(this.moduleData[label].url);
            }

          });
        }
      }

      this.objectKeys(this.moduleConfigComponent.removedFiles).forEach(label => {
        // this.uploadFileService.deleteFile(this.moduleConfigComponent.removedFiles[label]);
      });

      newActivity.moduleData = this.moduleConfigComponent.getValue();

      await this.uploadFiles(newActivity.moduleData);
      newActivity.moduleData = this.testdata;


    } else {
      let error = false;

      if (this.moduleDataChange) {
        this.toastService.presentToast(`Module content not filled. Please fill at least one of the fields.`, 'danger');
        // console.log('Module content not filled 1');
        error = true;
      } else {
        if (this.moduleData == null) {
          this.toastService.presentToast(`Module content not filled. Please fill at least one of the fields.`, 'danger');
          // console.log('Module content not filled 2');
          error = true;
        } else {
          // console.log('Module Data used');
          newActivity.moduleData = this.moduleData;
        }
      }

      if (error) {
        return;
      }
    }

    newActivity.title = this.activityName;
    newActivity.moduleId = this.selectedModuleId;
    newActivity.pinColor = this.pinColor;

    newActivity.startHour = this.startHour;
    newActivity.endHour = this.endHour;
    newActivity.startActivity = this.isStartsHereChecked;
    newActivity.finalActivity = this.isEndsHereChecked;
    newActivity.proximity = this.proximity;
    newActivity.tags = this.tags;
    newActivity.days = this.daysFormControl.value;
    if (this.originalAddress !== this.address) {
      if (this.newCoordinates.length > 0) {
        newActivity.lat = this.newCoordinates[0];
        newActivity.lng = this.newCoordinates[1];
      }
    }

    this.objectKeys(this.removedOriginalTargetConnections).forEach(tempEdgeId => {
      const connection: core.ConnectionModel = Object.assign({}, this.removedOriginalTargetConnections[tempEdgeId]);
      this.st.dispatch(new store.RemoveConnection(connection));
    });

    this.objectKeys(this.removedOriginalSourceConnections).forEach(tempEdgeId => {
      const connection: core.ConnectionModel = Object.assign({}, this.removedOriginalSourceConnections[tempEdgeId]);
      this.st.dispatch(new store.RemoveConnection(connection));
    });

    this.objectKeys(this.finalConnectionsTarget).forEach(tempEdgeId => {
      const connection: core.ConnectionModel = Object.assign({}, this.finalConnectionsTarget[tempEdgeId]);
      // if (connection.sourceId != null && connection.sourceId !== 0) {
      if (connection.sourceId != null) {
        connection.edgeId = 'edge_s_' + connection.sourceId + '_t_' + connection.targetId;
        if (this.originalTargetIds.indexOf(tempEdgeId) !== -1) {
          // UPDATE CONNECTION
          this.st.dispatch(new store.UpdateConnection(connection));
        } else {
          // CREATE NEW CONNECTION
          this.st.dispatch(new store.AddConnection(connection, false, false));
        }
      }
    });

    this.objectKeys(this.finalConnectionsSource).forEach(tempEdgeId => {
      const connection: core.ConnectionModel = Object.assign({}, this.finalConnectionsSource[tempEdgeId]);
      if (connection.targetId != null) {
        connection.edgeId = 'edge_s_' + connection.sourceId + '_t_' + connection.targetId;
        if (this.originalSourceIds.indexOf(tempEdgeId) !== -1) {
          // UPDATE CONNECTION
          this.st.dispatch(new store.UpdateConnection(connection));
        } else {
          // CREATE NEW CONNECTION
          this.st.dispatch(new store.AddConnection(connection, false, false));
        }
      }
    });

    // console.log(newActivity);
    this.saveForm.emit({ new: newActivity, old: oldActivity });

    if (this.isColorForChildren) {
      let connections;
      this.st.pipe(select(store.getConnectionsFromActivityAsSource(newActivity.id)), take(1)).subscribe(value => connections = value);
      this.activitesIdsAlreadyFilled.push(newActivity.id);

      connections.forEach(conn => {
        if (!this.activitesIdsAlreadyFilled.includes(conn.targetId)) {

          let act;
          this.st.pipe(select(store.getActivityById(conn.targetId)), take(1)).subscribe(value => act = value);
          this.recursiveFillChildren(act);
        }
      });

    }

    this.updateExperience.emit();

    this.changedConnection = false;
    this.activity = newActivity;
    this.moduleData = newActivity.moduleData;
    this.moduleDataChange = false;
    this.originalModule = this.selectedModule;
    this.coords = { lat: newActivity.lat, lng: newActivity.lng };
    this.cd.detectChanges();


    if (this.moduleConfigComponent) {
      this.moduleConfigComponent.setModuleContent();
    }

    this.closeThis();
  }

  recursiveFillChildren(activity: core.ActivityModel) {
    // console.log(activity);
    let connections;
    this.st.pipe(select(store.getConnectionsFromActivityAsSource(activity.id)), take(1)).subscribe(value => connections = value);
    // console.log(connections);
    const oldActivity = Object.assign({}, activity);
    const newActivity = Object.assign({}, activity);
    newActivity.pinColor = this.pinColor;
    this.activitesIdsAlreadyFilled.push(activity.id);
    this.saveForm.emit({ new: newActivity, old: oldActivity });


    if (connections.length === 0) {
      return;
    }

    connections.forEach(conn => {
      if (!this.activitesIdsAlreadyFilled.includes(conn.targetId)) {

        let act;
        this.st.pipe(select(store.getActivityById(conn.targetId)), take(1)).subscribe(value => act = value);
        this.recursiveFillChildren(act);
      }
    });
  }

  closeThis() {
    this.closeForm.emit();
  }



  configConnections() {
    // tslint:disable-next-line:max-line-length
    this.st.pipe(select(store.getConnectionsFromActivityAsTarget(this.activity.id)), take(1)).subscribe(value => this.connectionsAsTarget = value);
    // tslint:disable-next-line:max-line-length
    this.st.pipe(select(store.getConnectionsFromActivityAsSource(this.activity.id)), take(1)).subscribe(value => this.connectionsAsSource = value);

    this.numberOfConnectionsSource = this.connectionsAsSource.length;
    this.numberOfConnectionsTarget = this.connectionsAsTarget.length;

    this.connectionsAsTarget.forEach(c => {
      this.originalTargetIds.push(c.edgeId);
      this.sourcesInUseForThisTarget.push(c.sourceId);
      this.finalConnectionsTarget[c.edgeId] = c;
    });

    this.targetIndexForCreation = Object.keys(this.finalConnectionsTarget).length;
    this.edgeIdLastConnectionTarget = Object.keys(this.finalConnectionsTarget)[this.targetIndexForCreation - 1];

    this.connectionsAsSource.forEach(c => {
      this.originalSourceIds.push(c.edgeId);
      this.targetsInUseForThisSource.push(c.targetId);
      this.finalConnectionsSource[c.edgeId] = c;
    });

    this.sourceIndexForCreation = Object.keys(this.finalConnectionsSource).length;
    this.edgeIdLastConnectionSource = Object.keys(this.finalConnectionsSource)[this.sourceIndexForCreation - 1];

    if (this.sourceIndexForCreation === 0) {
      this.createConnectionSource();
    }

    if (this.targetIndexForCreation === 0) {
      this.createConnectionTarget();
    }
  }

  createConnectionTarget() {
    const newEdgeId = this.edgeIdLastConnectionTarget + '_' + this.targetIndexForCreation;
    let newConnectionId;
    this.st.pipe(select(store.getConnectionsNewId()), take(1)).subscribe(value => newConnectionId = value);
    const newConnection = new core.ConnectionModel(null, this.activity.id, newEdgeId, newConnectionId);
    // newConnection.sourceId = (this.numberOfConnectionsTarget === 0 ? 0 : null);
    this.finalConnectionsTarget[newConnection.edgeId] = newConnection;
    this.targetIndexForCreation++;
    // if (this.numberOfConnectionsTarget === 0) {
    //   this.numberOfConnectionsTarget++;
    //   this.sourcesInUseForThisTarget.push(0);
    // }

    this.cd.detectChanges();
  }

  createConnectionSource() {
    const newEdgeId = this.edgeIdLastConnectionSource + '_' + this.sourceIndexForCreation;
    let newConnectionId;
    this.st.pipe(select(store.getConnectionsNewId()), take(1)).subscribe(value => newConnectionId = value);
    const newConnection = new core.ConnectionModel(this.activity.id, null, newEdgeId, newConnectionId);
    this.finalConnectionsSource[newConnection.edgeId] = newConnection;
    this.sourceIndexForCreation++;

    this.cd.detectChanges();
  }

  addConnectionToTarget(obj) {
    const prevSource = obj.prevSource;
    const con = obj.con;
    if (prevSource != null) {
      this.removeSourceFromTargets(prevSource);
    } else {
      this.numberOfConnectionsTarget++;
    }

    this.changedConnection = true;

    this.finalConnectionsTarget[con.edgeId] = con;
    this.sourcesInUseForThisTarget.push(con.sourceId);
    this.cd.detectChanges();

  }

  addConnectionToSource(obj) {
    const prevTarget = obj.prevTarget;
    const con = obj.con;
    if (prevTarget != null) {
      this.removeTargetFromSources(prevTarget);
    } else {
      this.numberOfConnectionsSource++;
    }

    this.changedConnection = true;

    this.finalConnectionsSource[con.edgeId] = con;
    this.targetsInUseForThisSource.push(con.targetId);
    this.cd.detectChanges();
  }

  deleteConnectionTarget(con: core.ConnectionModel) {
    delete this.finalConnectionsTarget[con.edgeId];
    if (con.sourceId != null) {
      this.changedConnection = true;
      this.removeSourceFromTargets(con.sourceId);
      this.numberOfConnectionsTarget--;
      if (this.originalTargetIds.indexOf(con.edgeId) !== -1) {
        this.removedOriginalTargetConnections[con.edgeId] = con;
      }
    }

    this.cd.detectChanges();
  }

  deleteConnectionSource(con: core.ConnectionModel) {
    delete this.finalConnectionsSource[con.edgeId];
    if (con.targetId != null) {
      this.changedConnection = true;
      this.removeTargetFromSources(con.targetId);
      this.numberOfConnectionsSource--;
      if (this.originalSourceIds.indexOf(con.edgeId) !== -1) {
        this.removedOriginalSourceConnections[con.edgeId] = con;
      }
    }

    this.cd.detectChanges();
  }

  removeSourceFromTargets(id: number) {
    const index = this.sourcesInUseForThisTarget.indexOf(id);
    if (index > -1) {
      this.sourcesInUseForThisTarget.splice(index, 1);
    }
  }

  removeTargetFromSources(id: number) {
    const index = this.targetsInUseForThisSource.indexOf(id);
    if (index > -1) {
      this.targetsInUseForThisSource.splice(index, 1);
    }
  }

  remove() {
    this.removeThis.emit();
  }

  getAddresses(ev: any) {
    this.query = ev.target.value;
    this.resultAddresses = [];
    this.firstSearch = true;
    if (this.query && this.query.trim() !== '') {
      this.loadingAddresses = true;
      ELG.geocode().address(this.query.trim()).nearby([this.coords.lat, this.coords.lng]).run((err, results, response) => {
        if (err != null) {
          console.log(err);
          return;
        }

        results.results.forEach(address => {
          this.resultAddresses.push({ address: address.text, lat: address.latlng.lat, lng: address.latlng.lng });
        });

        this.loadingAddresses = false;
        this.cd.detectChanges();

      });
    }
    this.cd.detectChanges();

  }

  selectAddress(ev: any) {
    this.address = ev.target.innerText;
    this.newCoordinates = [ev.target.getAttribute('data-lat'), ev.target.getAttribute('data-lng')];
    this.query = '';

  }

  async previewActivity() {
    const newActivity: core.ActivityModel = Object.assign({}, this.activity);

    newActivity.title = this.activityName;
    if (this.moduleConfigComponent != null) {
      // console.log(this.moduleConfigComponent.getValue());
      newActivity.moduleData = this.moduleConfigComponent.getValue();
    }


    const modal = await this.modalController.create({
      component: PreviewActivityComponent,
      componentProps: { activity: newActivity, module: this.selectedModule },
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

  checkChangesToSave(): boolean {


    if (this.changedConnection) {
      // console.log('changedConnection');
      return true;
    }

    if (this.moduleDataChange) {
      // console.log('moduleDataChange');
      return true;
    } else if (this.moduleConfigComponent != null) {
      const modFiles = { ...this.moduleConfigComponent.images, ...this.moduleConfigComponent.videos, ...this.moduleConfigComponent.audios };
      if (this.objectKeys(modFiles).length > 0) {
        return true;
      } else {
        if (this.moduleData != null) {
          const originalDataWithoutMedia = Object.assign({}, this.moduleData);
          const newData = this.moduleConfigComponent.getValue();
          this.originalModule.htmlConfig.forEach(data => {
            if (data.type === 'image' || data.type === 'video' || data.type === 'audio') {
              originalDataWithoutMedia[data.label] = newData[data.label];
            }
          });

          // console.log(newData, originalDataWithoutMedia);


          if (!Underscore.isEqual(newData, originalDataWithoutMedia)) {
            console.log('newData, originalDataWithoutMedia');
            return true;
          }
        }
      }
    }

    const oldActivity: core.ActivityModel = Object.assign({}, this.activity);
    const newActivity: core.ActivityModel = Object.assign({}, this.activity);

    newActivity.title = this.activityName;
    newActivity.moduleId = this.selectedModuleId;
    newActivity.pinColor = this.pinColor;
    newActivity.startHour = this.startHour;
    newActivity.endHour = this.endHour;
    newActivity.startActivity = this.isStartsHereChecked;
    newActivity.finalActivity = this.isEndsHereChecked;
    newActivity.proximity = this.proximity;
    newActivity.tags = this.tags;
    newActivity.days = this.daysFormControl.value;
    if (this.originalAddress !== this.address) {
      if (this.newCoordinates.length > 0) {
        newActivity.lat = this.newCoordinates[0];
        newActivity.lng = this.newCoordinates[1];
      }
    }

    return !Underscore.isEqual(oldActivity, newActivity);

  }


}
