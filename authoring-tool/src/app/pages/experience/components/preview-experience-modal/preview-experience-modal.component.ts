import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as store from './../../../experience/store';
import * as core from './../../../../core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { PreviewActivityComponent } from '../preview-activity/preview-activity.component';

@Component({
  selector: 'app-preview-experience-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './preview-experience-modal.component.html',
  styleUrls: ['./preview-experience-modal.component.scss'],
})
export class PreviewExperienceModalComponent implements OnInit {
  @ViewChild(PreviewActivityComponent) child: PreviewActivityComponent;

  activities$: Observable<core.ActivityModel[]>;
  selectedActivity: core.ActivityModel;
  nextSelectedActivity: core.ActivityModel;

  selectedModule: core.ModuleModel;
  nextSelectedModule: core.ModuleModel;

  started: boolean;
  selected: boolean;
  finished: boolean;
  childrenActivities: core.ActivityModel[];
  nextChildrenActivities: core.ActivityModel[];
  selectedAct: number;
  constructor(
    private st: Store<store.DashboardState>,
    private modalController: ModalController,
    public cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.started = false;
    this.selected = false;
    this.finished = false;
    this.selectedActivity = null;
    this.selectedModule = null;
    this.activities$ = this.st.pipe(select(store.getAllActivities));
  }

  selectActivity(ev) {
    this.getActivitiesData(ev.value);
  }

  previewActivity() {
    this.started = true;
    if (!this.selected) {
      this.getActivitiesData(this.selectedAct);
    }
    this.nextSelectedActivity = this.selectedActivity;
    this.nextSelectedModule = this.selectedModule;

    if (this.child != null) {
      this.cd.detectChanges();
    }

    this.nextChildrenActivities = this.childrenActivities;
    if (this.nextChildrenActivities.length > 0) {
      this.selectedAct = this.nextChildrenActivities[0].id;
    } else {
      this.finished = true;
    }

    this.selected = false;

    this.cd.detectChanges();

  }

  getActivitiesData(id) {
    this.st.pipe(select(store.getActivityById(id)), take(1)).subscribe(value => this.selectedActivity = value);
    this.st.pipe(select(store.getModuleById(this.selectedActivity.moduleId)), take(1)).subscribe(value => this.selectedModule = value);
    this.st.pipe(select(store.getActivitiesFromActivityAsSource(this.selectedActivity.id)), take(1)).
      subscribe(value => this.childrenActivities = value);
    this.selected = true;
  }

  leavePreview() {
    this.modalController.dismiss(null, 'confirm');
  }

  closeModal() {
    this.modalController.dismiss(null, 'cancel');
  }

}
