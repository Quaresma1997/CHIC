import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import * as core from './../../../../core';
import * as store from './../../../../store';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-map-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-activity.component.html',
  styleUrls: ['./map-activity.component.scss'],
})
export class MapActivityComponent implements OnInit {
  @Input() activity: core.ActivityModel;
  @Input() experienceId: string;
  constructor(private st: Store<store.AppState>) { }

  ngOnInit() {}

  startActivity() {
    this.st.dispatch(new store.Go({ path: ['/experiences/' + this.experienceId + '/' + this.activity.id] }));
  }

}
