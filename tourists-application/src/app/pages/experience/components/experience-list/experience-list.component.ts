import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import * as core from './../../../../core';
import * as store from './../../../dashboard/store';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { take, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-experience-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience-list.component.html',
  styleUrls: ['./experience-list.component.scss'],
})
export class ExperienceListComponent implements OnInit, OnDestroy {
  experience$: Observable<core.ExperienceModel>;
  activities$: Observable<core.ActivityModel[]>;
  activities: core.ActivityModel[];
  activitiesCompleted$: Observable<core.ActivityModel[]>;
  allActivities$: Observable<core.ActivityModel[]>;
  inited = false;
  subscription: Subscription;
  subscription2 = new Subscription();
  constructor(
    private st: Store<store.DashboardState>,
    public cd: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnInit() {
    this.experience$ = this.st.pipe(select(store.getSelectedExperience));
    this.activities$ = this.st.pipe(select(store.getAllAvailableActivities));
    this.activitiesCompleted$ = this.st.pipe(select(store.getAvailableActivitiesCompleted()));
    this.allActivities$ = this.st.pipe(select(store.getAllActivities));
    this.createEnterSubscription();
    this.startSubscriptionActivities();
  }

  startSubscriptionActivities() {
    this.subscription = new Subscription();
    const sub = this.activities$.subscribe(activities => {
      if (activities.length !== 0) {
        this.st.pipe(select(store.getActivitiesOrderedByDistance), take(1)).subscribe(value => this.activities = value);
        this.cd.detectChanges();
      }

    });
    this.subscription.add(sub);
  }

  createEnterSubscription() {
    let experienceId;
    this.st.pipe(select(store.getSelectedExperienceId), take(1)).subscribe(value => experienceId = value);
    const mapUrl = '/experiences/' + experienceId + '/list';
    this.inited = true;
    const sub2 = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (e.url === mapUrl && !this.inited) {
          this.startSubscriptionActivities();

        }
      });
    this.subscription2.add(sub2);
  }

  destroy() {
    this.inited = false;
    this.subscription.unsubscribe();
  }

  ngOnDestroy() {
    this.destroy();
    this.subscription2.unsubscribe();
  }



}
