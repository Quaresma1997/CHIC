import { Component, OnInit, Input, ViewChildren, ChangeDetectorRef, QueryList, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { AudioComponent } from '../audio/audio.component';
import * as core from './../../../../core';
import * as store from './../../../dashboard/store';
import { Store, select } from '@ngrx/store';
import { take, takeWhile, takeUntil, filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ComponentCanDeactivate } from '../../guards';
import { NavigationEnd, Router, NavigationStart } from '@angular/router';
import { ToastService, LocalStorageService } from './../../../../core';
import { CommonStoreActionService } from 'src/app/core/services/commonStoreActions.service';

@Component({
  selector: 'app-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements OnInit, OnDestroy, ComponentCanDeactivate {

  activity: core.ActivityModel;
  activities$: Observable<core.ActivityModel[]>;
  module: core.ModuleModel;
  experienceId: string;
  inited = false;
  actUrl: string;

  lockCompletedBtn: boolean;

  firstEntry: boolean;
  beforeEnter = true;

  subscription = new Subscription();
  subscription2 = new Subscription();
  subscription3 = new Subscription();

  location = {};

  constructor(
    private st: Store<store.DashboardState>,
    public cd: ChangeDetectorRef,
    private toastService: ToastService,
    private storage: LocalStorageService,
    private router: Router,
    public common: CommonStoreActionService
  ) { }

  ngOnInit() {
    this.startVariables();
    this.lockCompletedBtn = true;
    this.activities$ = this.st.pipe(select(store.getAllAvailableActivities));

    this.createEnterSubscription();
    this.setActivitiesSub();

  }

  setActivitiesSub() {
    const sub = this.activities$.subscribe(activities => {
      if (activities.length !== 0) {
        if (this.firstEntry) {
          this.st.pipe(select(store.getSelectedActivity), take(1)).subscribe(value => this.activity = value);
          if (this.activity != null) {
            if (!this.activity.completed) {
              this.storage.setActivityCompletedFalse(this.experienceId, this.activity.id);
            }
            if (!this.activity.blocked || this.activity.completed) {
              this.removeSiblingsActivities();
              this.st.pipe(select(store.getModuleById(this.activity.moduleId)), take(1)).subscribe(value => this.module = value);
              this.setLocationSubscription();
              this.firstEntry = false;

            }
          } else {
            return;
          }
        }


        if (!this.activity.completed) {
          let goalsCompleted;
          this.st.pipe(select(store.getAllActivityGoalsCompleted(this.activity.id)), take(1)).subscribe(value => goalsCompleted = value);
          this.lockCompletedBtn = !goalsCompleted;
        }

        this.cd.detectChanges();

      }

    });
    this.subscription.add(sub);
  }

  removeSiblingsActivities() {
    let parentsCompleted;
    this.st.pipe(select(store.getActivitiesFromActivityAsTarget(this.activity.id)), take(1)).subscribe(value => parentsCompleted = value);
    if (parentsCompleted.length === 0) {
      return;
    }

    const childrenToRemove = [];

    parentsCompleted.forEach(parent => {
      let childrenNotCompleted: core.ActivityModel[];
      this.st.pipe(select(store.getActivitiesFromActivityAsSourceNotCompleted(parent.id)),
        take(1)).subscribe(value => childrenNotCompleted = value);
      const index = childrenNotCompleted.indexOf(this.activity, 0);
      if (index > -1) {
        childrenNotCompleted.splice(index, 1);
      }
      childrenNotCompleted.forEach(child => {
        if (!childrenToRemove.includes(child.id)) {
          childrenToRemove.push(child.id);
        }
      });
    });


    this.st.dispatch(new store.RemoveActivitesAvailable(childrenToRemove));
  }

  setLocationSubscription() {
    const sub2 = this.st.pipe(select(store.getExperienceLocation)).subscribe(location => {
      if (location != null) {
        this.location = location;
        this.cd.detectChanges();
      }

    });
    this.subscription3.add(sub2);
  }

  createEnterSubscription() {
    this.st.pipe(select(store.getSelectedExperienceId), take(1)).subscribe(value => this.experienceId = value);
    let activityId;
    this.st.pipe(select(store.getRouterId), take(1)).subscribe(value => activityId = value);
    this.actUrl = '/experiences/' + this.experienceId + '/' + activityId;
    this.inited = true;
    const sub2 = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (e.url === this.actUrl && !this.inited) {
          this.restart();
          // console.log(this.child);
          // this.child.restart();

        }
      });
    this.subscription2.add(sub2);
  }

  startVariables() {
    this.location = null;
    this.firstEntry = true;
    this.cd.detectChanges();
  }

  restart() {
    this.subscription3 = new Subscription();
    this.subscription = new Subscription();
    this.startVariables();
    this.setActivitiesSub();

  }

  destroy() {
    this.subscription.unsubscribe();
    this.subscription3.unsubscribe();
    this.inited = false;
    this.activity = null;
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.destroy();
    this.subscription2.unsubscribe();
  }


}
