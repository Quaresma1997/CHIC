import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as core from './../../../../core';
import * as store from './../../../dashboard/store';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { LocalStorageService } from './../../../../core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-experience-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience-intro.component.html',
  styleUrls: ['./experience-intro.component.scss'],
})
export class ExperienceIntroComponent implements OnInit {
  experience$: Observable<core.ExperienceModel>;
  startedActivities: number[];
  constructor(
    private st: Store<store.DashboardState>,
    public cd: ChangeDetectorRef,
    private storage: LocalStorageService,
  ) { }

  ngOnInit() {
    this.experience$ = this.st.pipe(select(store.getSelectedExperience));
  }

  async restart() {
    let experience;
    this.st.pipe(select(store.getSelectedExperience), take(1)).subscribe(value => experience = value);
    const activities = await this.storage.get(experience.id);
    experience.activities.forEach(activity => {
      this.st.dispatch(new store.SetActivityCompleted(false, activity.id));
    });
    this.st.dispatch(new store.SetExperienceCompleted(false, experience.id));
    if (activities != null) {
      await this.storage.remove(experience.id + '_sequence');
      await this.storage.remove(experience.id);
    }

    this.startFunctions();
  }

  async startFunctions() {
    this.startedActivities = [];
    this.st.dispatch(new store.ClearActivitesAvailable());
    this.st.dispatch(new store.ClearActivitesSequence());

    // console.log(this.startedActivities);

    const startingActivitiesCompletedAndNoParents = [];
    const startingActivities = [];

    let activities: core.ActivityModel[];
    this.st.pipe(select(store.getAllActivities), take(1)).subscribe(value => activities = value);
    // console.log(activities);
    if (activities.length === 0) {
      return;
    }

    activities.forEach(act => {
      let connections;
      this.st.pipe(select(store.getConnectionsFromActivityAsTarget(act.id)), take(1)).subscribe(value => connections = value);
      if (act.completed && connections.length === 0) {
        startingActivitiesCompletedAndNoParents.push(act);
      }

      if (act.startActivity === true || connections.length === 0 || act.completed) {
        startingActivities.push(act);
      }
    });

    if (startingActivities.length === 0) {
      this.st.dispatch(new store.SetActivitesAvailable([activities[0]]));

    } else {
      this.st.dispatch(new store.SetActivitesAvailable(startingActivities));
    }

    startingActivitiesCompletedAndNoParents.forEach(activity => {
      const path = [];
      path.push(activity.id);
      this.recursive(activity, path);
    });

  }

  recursive(activity: core.ActivityModel, path) {
    const activityId = activity.id;
    // console.log('ENTERED ' + activityId);
    let activities;
    // console.log('\n\n');
    this.st.pipe(select(store.getActivitiesFromActivityAsSource(activityId)), take(1)).subscribe(value => activities = value);
    if (activities.length === 0) {
      // console.log('NO CHILDREN ' + activityId);
      this.st.dispatch(new store.SetActivitesAvailable([activity]));
      return;
    }
    for (const act of activities) {
      if (!path.includes(act.id)) {
        if (act.completed) {
          // console.log('FOUND IN ' + activityId);
          path.push(act.id);
          this.recursive(act, path);
          return;
        } else if (this.startedActivities.includes(act.id)) {
          let newAct;
          this.st.pipe(select(store.getActivitiesNotInAvailable([act])), take(1)).subscribe(value => newAct = value);
          if (newAct.length > 0) {
            this.st.dispatch(new store.SetActivitesAvailable(newAct));
          }
          return;
        }
      }

    }
    // console.log('CHILDREN NOT COMPLETED ' + activityId);
    // console.log(activities);
    // console.log('\n\n');
    let newActivites;
    this.st.pipe(select(store.getActivitiesNotInAvailable(activities)), take(1)).subscribe(value => newActivites = value);
    // console.log(newActivites);
    if (newActivites.length > 0) {
      this.st.dispatch(new store.SetActivitesAvailable(newActivites));
    }
  }

}
