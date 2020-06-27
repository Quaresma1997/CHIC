import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as store from './../../pages/dashboard/store';
import * as store2 from './../../store';
import { ActivityModel } from '../models';
import { take } from 'rxjs/operators';
import { distance } from '../auxFunctions';
import { LocalStorageService } from './localStorage.service';
import { ToastService } from './toast.service';
import { ModalController } from '@ionic/angular';
import { CompletedModalComponent } from 'src/app/pages/experience/components/completed-modal/completed-modal.component';

@Injectable({ providedIn: 'root' })
export class CommonStoreActionService {
    leave: boolean;
    constructor(
        private st: Store<store.DashboardState>, private storage: LocalStorageService,
        public modalController: ModalController,
        private toastService: ToastService, private st2: Store<store2.AppState>) {
        this.leave = false;
    }

    setActivitiesAvailability(location) {
        let activities: ActivityModel[];
        this.st.pipe(select(store.getAllAvailableActivities), take(1)).subscribe(value => activities = value);
        activities.forEach(activity => {
            if (activity != null) {
                const dist = distance(location[0], location[1], activity.lat, activity.lng);
                if (dist <= activity.proximity) {
                    this.st.dispatch(new store.UpdateActivity(false, Math.round(dist), activity.id));
                } else {
                    this.st.dispatch(new store.UpdateActivity(true, Math.round(dist), activity.id));
                }
            }

        });
    }

    async completeActivity(activity: ActivityModel, experienceId) {
        this.st.dispatch(new store.SetActivityCompleted(true, activity.id));
        this.storage.setActivityCompletedTrue(experienceId, activity.id);
        this.storage.setActivitySequence(experienceId, activity.id);
        this.toastService.presentToast(`Activity completed`, 'success');
        let allActivitiesCompleted;
        this.st.pipe(select(store.getAllActivitiesCompleted()), take(1)).subscribe(value => allActivitiesCompleted = value);
        this.st.dispatch(new store.SetActivitesSequence(activity));
        if (allActivitiesCompleted || activity.finalActivity) {
            if (!allActivitiesCompleted) {
                this.setNewAvailableActivities(activity.id);
                this.openExperienceCompletedModal(false);
            } else {
                this.openExperienceCompletedModal(true);
                this.st.dispatch(new store.SetExperienceCompleted(true, experienceId));
                this.toastService.presentToast(`Experience completed`, 'success');
            }
        } else {
            this.setNewAvailableActivities(activity.id);
        }

        this.st2.dispatch(new store2.Go({ path: ['/experiences/' + experienceId + '/map'] }));
    }

    async openExperienceCompletedModal(comp: boolean) {
        const modal = await this.modalController.create({
            component: CompletedModalComponent,
            componentProps: { completed: comp },
            cssClass: 'completedModalClass',
        });

        modal.onDidDismiss()
            .then((result) => {
                this.leave = (result.data === 'confirm');
                if (this.leave) {
                    this.st2.dispatch(new store2.Go({ path: ['/dashboard/'] }));
                }
            });

        return await modal.present();
    }

    async setNewAvailableActivities(activityId) {
        let activities;
        this.st.pipe(select(store.getActivitiesFromActivityAsSourceNotCompleted(activityId)),
            take(1)).subscribe(value => activities = value);
        let newActivites;
        this.st.pipe(select(store.getActivitiesNotInAvailable(activities)), take(1)).subscribe(value => newActivites = value);
        if (activities.length === newActivites.length) {
            await this.st.dispatch(new store.SetActivitesAvailable(activities));
            let location;
            this.st.pipe(select(store.getExperienceLocation), take(1)).subscribe(value => location = value);
            if (location != null) {
                this.setActivitiesAvailability(location);
            }
        }

    }

}
