import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import * as store from './../../../../store';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-experience-toolbar',
  templateUrl: './experience-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./experience-toolbar.component.scss'],
})
export class ExperienceToolbarComponent implements OnInit {
  constructor(private st: Store<store.AppState>) { }

  ngOnInit() { }

  goBack() {
    this.st.dispatch(new store.Back());
  }


}
