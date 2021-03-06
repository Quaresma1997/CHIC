import { Component, OnInit, ChangeDetectionStrategy, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription, fromEvent, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as store from './../../store';
import { take, filter } from 'rxjs/operators';
import * as core from './../../../../core';
import { LocalStorageService, ToastService } from './../../../../core';
import * as store2 from './../../../../store';
import { Platform } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  experiences$: Observable<core.ExperienceModel[]>;
  location = [];
  watchId: any;
  inited = false;
  subscription2 = new Subscription();

  constructor(
    private st: Store<store.DashboardState>,
    private st2: Store<store2.AppState>,
    private storage: LocalStorageService,
    private platform: Platform,
    private toastService: ToastService,
    public cd: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnInit() {
    this.location = null;
    this.startLocation();
    this.experiences$ = this.st.pipe(select(store.getExperiencesOrdered(this.location)));
    this.cd.detectChanges();
    this.setCompleted();
    this.setFavourites();
    this.createEnterSubscription();
  }

  createEnterSubscription() {
    const url = '/dashboard';
    this.inited = true;
    const sub2 = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (e.url === url && !this.inited) {
          this.restart();

        }
      });
    this.subscription2.add(sub2);
  }

  restart() {
    this.experiences$ = this.st.pipe(select(store.getExperiencesOrdered(this.location)));
    this.cd.detectChanges();
    this.startLocation();
  }

  async startLocation() {
    await this.platform.ready();
    this.watchId = navigator.geolocation.watchPosition(this.updateLocation.bind(this), this.updateLocationError.bind(this),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }

  updateLocation(position) {
    // console.log(position);
    const location = [position.coords.latitude, position.coords.longitude];
    if (this.location == null) {
      this.setLocation(location);
    } else if (location[0] !== this.location[0] && location[1] !== this.location[1]) {
      this.setLocation(location);
    }
  }

  setLocation(location) {
    this.location = location;
    this.experiences$ = this.st.pipe(select(store.getExperiencesOrdered(this.location)));
    this.cd.detectChanges();
  }

  updateLocationError(positionError) {
    this.toastService.presentToast(`Error geting user location`, 'danger');
    // console.log('ERROR', positionError);
  }

  async setFavourites() {
    const favourites = await this.storage.get('favourites');
    if (favourites != null) {
      if (favourites.length > 0) {
        favourites.forEach(experienceId => {
          this.st.dispatch(new store.SetExperienceFavourite(true, experienceId));
        });
      }
    }
  }

  async setCompleted() {

    const keys = await this.storage.keys();
    for (const key of keys) {
      if (key === 'favourites' || key.includes('sequence')) {
        continue;
      }
      const allTrue = await this.storage.getExperiencesCompleted(key);
      if (allTrue) {
        const activities = await this.storage.get(key);

        let experience: core.ExperienceModel;
        this.st.pipe(select(store.getExperienceById(key)), take(1)).subscribe(value => experience = value);
        if (experience.activities.length === Object.keys(activities).length) {
          this.st.dispatch(new store.SetExperienceCompleted(true, key));
        }

      }
    }
  }

  searchExperiences(query: string) {
    this.experiences$ = this.st.pipe(select(store.getExperiencesByTitle(query, this.location)));
    this.cd.detectChanges();
  }


  goToMap() {
    this.st2.dispatch(new store2.Go({ path: [`/experiences-map`] }));
  }

  destroy() {
    this.inited = false;
    navigator.geolocation.clearWatch(this.watchId);
  }

  ngOnDestroy() {
    this.destroy();
    this.subscription2.unsubscribe();
  }
}
