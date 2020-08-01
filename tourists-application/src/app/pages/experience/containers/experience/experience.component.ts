import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { select, Store } from '@ngrx/store';

import * as core from './../../../../core';
import * as store from './../../../dashboard/store';
import * as store2 from './../../../../store';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { ModalController, NavController, IonTabs, Platform } from '@ionic/angular';
import { take, filter, switchMap } from 'rxjs/operators';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { ToastService, LocalStorageService } from './../../../../core';
import { CommonStoreActionService } from 'src/app/core/services/commonStoreActions.service';

// import { Plugins} from @capacitor

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss'],
})
export class ExperienceComponent implements OnInit, OnDestroy {
  experience: core.ExperienceModel;
  subscription = new Subscription();
  subscription2: Subscription;
  inited = false;
  destroyed = false;
  urlExperience: string;
  location: any[];

  watchId: any;

  startedActivities: number[];

  startingActivitiesCompleted: core.ActivityModel[];

  constructor(
    private st: Store<store.DashboardState>,
    public cd: ChangeDetectorRef,
    private router: Router,
    private platform: Platform,
    private toastService: ToastService,
    private storage: LocalStorageService,
    private common: CommonStoreActionService) { }

  ngOnInit() {
    this.startFunctions();

    this.urlExperience = '/experiences/' + this.experience.id;

    this.inited = true;
    const sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (e.url === this.urlExperience && !this.inited) {
          console.log('EXPERIENCE ' + this.experience.id + ' ENTERED');

          this.startFunctions();
          // console.log(this.child);
          // this.child.restart();

        }
      });
    this.subscription.add(sub);
  }

  destroy() {
    if (this.subscription2 != null) {
      this.subscription2.unsubscribe();
    }

    this.inited = false;
    this.destroyed = true;
    navigator.geolocation.clearWatch(this.watchId);
    // this.child.destroy();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (!this.destroyed) {
      this.destroy();
    }
  }

  async startLocation() {
    await this.platform.ready();
    this.watchId = navigator.geolocation.watchPosition(this.updateLocation.bind(this), this.updateLocationError.bind(this),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }

  async startFunctions() {
    this.st.pipe(select(store.getSelectedExperience), take(1)).subscribe(value => this.experience = value);
    this.startedActivities = [];
    this.st.dispatch(new store.LoadConnectionsSuccess(this.experience.connections));
    this.st.dispatch(new store.ClearActivitesAvailable());
    this.st.dispatch(new store.ClearActivitesSequence());
    this.st.dispatch(new store.LoadActivitiesSuccess(this.experience.activities));
    await this.getActivitiesCompleted();

    // console.log(this.startedActivities);

    this.createLeaveToDashboardSubscription();

    const startingActivitiesCompletedAndNoParents = [];
    const startingActivities = [];

    let activities: core.ActivityModel[];
    this.st.pipe(select(store.getAllActivities), take(1)).subscribe(value => activities = value);
    // console.log(activities);
    if (activities.length === 0) {
      this.startLocation();
      return;
    }

    activities.forEach(act => {
      let connections;
      this.st.pipe(select(store.getConnectionsFromActivityAsTarget(act.id)), take(1)).subscribe(value => connections = value);
      if (act.completed) {
        startingActivitiesCompletedAndNoParents.push(act);
      }

      if (act.startActivity === true || connections.length === 0 || act.completed) {
        startingActivities.push(act);
      }
    });

    if (startingActivities.length === 0) {
      // console.log('NO START ACTIVITY, SENT: ');
      // console.log(activities[0]);
      this.st.dispatch(new store.SetActivitesAvailable([activities[0]]));

    } else {
      // console.log(startingActivitiesCompletedAndNoParents);
      this.st.dispatch(new store.SetActivitesAvailable(startingActivities));
    }
    // console.log(startingActivitiesCompletedAndNoParents);
    startingActivitiesCompletedAndNoParents.forEach(activity => {
      const path = [];
      path.push(activity.id);
      this.recursive(activity, path);
    });

    // this.showMenuLabels = false;
    await this.getActivitiesSequence();
    this.startLocation();
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
    if (newActivites.length > 0) {
      this.st.dispatch(new store.SetActivitesAvailable(newActivites));
    }

  }

  async getActivitiesCompleted() {
    const activities = await this.storage.get(this.experience.id);
    // console.log(activities);
    if (activities != null && Object.keys(activities).length > 0) {
      for (const id of Object.keys(activities)) {
        if (typeof activities[id] === 'boolean') {
          if (activities[id]) {
            this.st.dispatch(new store.SetInitialActivityCompleted(true, parseInt(id, 10)));
          } else {
            this.startedActivities.push(parseInt(id, 10));
          }
        } else {
          this.startedActivities.push(parseInt(id, 10));
          this.st.dispatch(new store.SetInitialActivityGoals(activities[id], parseInt(id, 10)));
        }

      }
    }

  }

  async getActivitiesSequence() {
    const activities = await this.storage.get(this.experience.id + '_sequence');
    if (activities != null && activities.length > 0) {
      activities.forEach(act => {
        let activity;
        this.st.pipe(select(store.getActivityById(act)), take(1)).subscribe(value => activity = value);
        if (activity != null) {
          this.st.dispatch(new store.SetActivitesSequence(activity));
        }

      });
    }
  }

  createLeaveToDashboardSubscription() {
    this.subscription2 = new Subscription();
    const sub2 = this.router.events
      .pipe(filter(e => e instanceof NavigationStart))
      .subscribe((e: NavigationStart) => {
        if (e.url === '/dashboard') {
          // console.log('DESTROY ' + this.experience.id);
          // this.showMenuLabels = false;

          this.destroy();
        }
      });
    this.subscription2.add(sub2);
  }

  updateLocation(position) {
    const location = [position.coords.latitude, position.coords.longitude];
    if (this.location == null) {
      this.setLocation(location);
    } else if (location[0] !== this.location[0] && location[1] !== this.location[1]) {
      this.setLocation(location);
    }
  }

  setLocation(location) {
    this.location = location;
    this.common.setActivitiesAvailability(location);
    this.st.dispatch(new store.SetExperienceLocation(location));
    // this.toastService.presentToast(`Localização atualizada`, 'success');
  }

  updateLocationError(positionError) {
    this.toastService.presentToast(`Error getting user location`, 'danger');
    // console.log('ERROR', positionError);
  }

  /*enterExperience() {
    this.experienceEntered = true;
    // this.st.dispatch(new store2.Go({ path: ['/experiences/' + this.experience.id + '/list'] }));
  }*/

}
