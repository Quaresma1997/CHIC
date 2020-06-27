import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import * as core from './../../../../core';
import * as store from './../../../dashboard/store';
import { Store } from '@ngrx/store';
import * as store2 from './../../../../store';
import { LocalStorageService } from './../../../../core';

enum ExperienceState {
  Start,
  Continue,
  Restart,
  FullCompleted,
  PartialCompleted
}

@Component({
  selector: 'app-map-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-experience.component.html',
  styleUrls: ['./map-experience.component.scss'],
})
export class MapExperienceComponent implements OnInit {
  @Input() experience: core.ExperienceModel;

  @Input() experienceState: ExperienceState;
  @Input() experienceStateLabel: string;
  constructor(private st: Store<store.DashboardState>, private st2: Store<store2.AppState>, private storage: LocalStorageService) { }

  ngOnInit() { }

  async go() {
    switch (this.experienceState) {
      case ExperienceState.Start:
      case ExperienceState.Continue:
        this.st.dispatch(new store2.Go({ path: [`/experiences/${this.experience.id}`] }));
        break;
      case ExperienceState.Restart:
        const activities = await this.storage.get(this.experience.id);
        this.experience.activities.forEach(activity => {
          this.st2.dispatch(new store.SetActivityCompleted(false, activity.id));
        });
        this.st2.dispatch(new store.SetExperienceCompleted(false, this.experience.id));
        if (activities != null) {
          await this.storage.remove(this.experience.id + '_sequence');
          await this.storage.remove(this.experience.id);
        }
        this.st.dispatch(new store2.Go({ path: [`/experiences/${this.experience.id}`] }));
        break;
      default:
        break;
    }
  }

}
