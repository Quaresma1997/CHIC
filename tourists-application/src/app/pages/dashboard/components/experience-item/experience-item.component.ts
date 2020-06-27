import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { ExperienceModel, LocalStorageService } from 'src/app/core';
import * as store from './../../../../store';
import * as store2 from './../../store';
import { Store } from '@ngrx/store';

enum ExperienceState {
  Start,
  Continue,
  Restart,
}

@Component({
  selector: 'app-experience-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience-item.component.html',
  styleUrls: ['./experience-item.component.scss']
})



export class ExperienceItemComponent implements OnInit {
  @Input() experience: ExperienceModel;
  @Input() completed: any;
  @Input() favourite: any;
  experienceState: ExperienceState;
  experienceStateLabel: string;
  constructor(
    public cd: ChangeDetectorRef,
    private storage: LocalStorageService, private st: Store<store.AppState>, private st2: Store<store2.DashboardState>, ) { }

  ngOnInit() { }

  async go() {
    this.st.dispatch(new store.Go({ path: [`/experiences/${this.experience.id}`] }));
  }

  async markFavourite() {
    this.storage.setExperienceFavourite(!this.favourite, this.experience.id);
    this.st2.dispatch(new store2.SetExperienceFavourite(!this.favourite, this.experience.id));
  }

}
