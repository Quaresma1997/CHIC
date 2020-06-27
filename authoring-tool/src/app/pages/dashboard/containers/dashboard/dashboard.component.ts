import { Component, OnInit, ChangeDetectionStrategy, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Content } from '@angular/compiler/src/render3/r3_ast';
import { Subscription, fromEvent, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as store from './../../../experience/store';
import { take } from 'rxjs/operators';
import * as core from './../../../../core';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  experiences$: Observable<core.ExperienceModel[]>;

  constructor(
    public cd: ChangeDetectorRef,
    private st: Store<store.DashboardState>
  ) { }

  ngOnInit() {
    this.experiences$ = this.st.pipe(select(store.getAllExperiences));
  }

  searchExperiences(query: string) {
    this.experiences$ = this.st.pipe(select(store.getExperiencesByTitle(query)));
  }

}
