import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';

import * as core from './../../../../core';
import * as store from './../../../experience/store';
import * as store2 from './../../../../store';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { ModalController, IonMenu } from '@ionic/angular';
import { InteractEvent } from '@interactjs/types/types';
import { take, filter, switchMap } from 'rxjs/operators';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { ComponentCanDeactivate } from '../../guards/confirm-deactivate.guard';
import * as actions from './../../store/actions';
import { ActivityMenuAndDragComponent } from '../activity-menu-and-drag/activity-menu-and-drag.component';

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})


export class ExperienceComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(ActivityMenuAndDragComponent) child: ActivityMenuAndDragComponent;
  @ViewChild('menu') menu: IonMenu;

  experience: core.ExperienceModel;

  subscription = new Subscription();

  inited = false;
  destroyed = false;

  urlExperience: string;

  constructor(
    private st: Store<store.DashboardState>, private appSt: Store<store2.AppState>,
    public cd: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
    this.startFunctions();

    this.urlExperience = '/experiences/' + this.experience.id;

    this.inited = true;
    const sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (e.url === this.urlExperience && !this.inited) {
          console.log('EXPERIENCE ' + this.experience.id + ' ENTERED');
          this.menu.side = 'start';
          this.startFunctions();
          this.destroyed = false;
          this.child.restart();

        }
      });
    this.subscription.add(sub);

  }

  startFunctions() {
    this.st.pipe(select(store.getSelectedExperience), take(1)).subscribe(value => this.experience = value);
    console.log(this.experience);
    this.st.dispatch(new store.LoadActivitiesSuccess(this.experience.activities));
    this.st.dispatch(new store.LoadConnectionsSuccess(this.experience.connections));
  }

  destroy() {
    // this.subscription2.unsubscribe();
    this.inited = false;
    this.destroyed = true;
    this.menu.side = 'end';
    this.child.destroy();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (!this.destroyed) {
      this.destroy();
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.destroyed) {
      return true;
    }

    let hasChanges;
    this.st.pipe(select(store.getExperiencesHasChanges, take(1))).subscribe(value => hasChanges = value);
    if (!hasChanges) {
      if (this.child.updateActivityInstance != null) {
        if (this.child.updateActivityInstance.checkChangesToSave()) {
          hasChanges = true;
        }
      }
    }

    // console.log(action);
    return !hasChanges;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (!this.canDeactivate()) {
      $event.returnValue = 'Do you want to leave without saving? Any changes made will be lost!';
    }
  }

  async goHome() {
    await this.menu.close();

    this.appSt.dispatch(new store2.Go({ path: ['/dashboard'] }));

  }

}
