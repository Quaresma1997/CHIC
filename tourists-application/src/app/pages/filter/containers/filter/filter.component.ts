import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as store from './../../../dashboard/store';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
  order: string;
  proximity: number;
  selectedTag: string;
  tags$: Observable<string[]>;
  constructor(public cd: ChangeDetectorRef, private st: Store<store.DashboardState>) { }

  ngOnInit() {
    this.tags$ = this.st.pipe(select(store.getExperiencesTags()));
    this.selectedTag = '';
    this.st.pipe(select(store.getExperienceOrder), take(1)).subscribe(value => this.order = value);
    this.proximity = 0;
    let filters;
    this.st.pipe(select(store.getExperienceFilter), take(1)).subscribe(value => filters = value);
    Object.keys(filters).forEach(key => {
      switch (key) {
        case 'proximity':
          this.proximity = filters[key];
          break;
        case 'tag':
          this.selectedTag = filters[key];
          break;
        default:
          break;
      }
    });
    console.log(filters);

    this.cd.detectChanges();
  }

  changeOrder() {
    this.st.dispatch(new store.SetExperienceOrder(this.order));
  }

  changeFilter(filter, value?) {
    if (filter === 'proximity') {
      this.st.dispatch(new store.SetExperienceFilter({ proximity: this.proximity }));
    } else if (filter === 'tag') {
      this.selectedTag = value;
      this.cd.detectChanges();
      this.st.dispatch(new store.SetExperienceFilter({ tag: value }));
    }
  }
}
