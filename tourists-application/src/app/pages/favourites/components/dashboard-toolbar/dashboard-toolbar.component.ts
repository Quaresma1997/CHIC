import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-toolbar',
  templateUrl: './dashboard-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./dashboard-toolbar.component.scss'],
})
export class DashboardToolbarComponent implements OnInit, OnDestroy {
  @Output() searchExperiences: EventEmitter<any> = new EventEmitter();
  query: string;
  showSearchBar: boolean;
  subscription3 = null;
  constructor(public cd: ChangeDetectorRef) { }

  ngOnInit() { }

  getExperiences(ev: any) {
    // set query to the value of the searchbar
    const query = ev.target.value;

    // if the value is an empty string don't filter the items
    this.searchExperiences.emit(query.trim());
  }

  setSearch() {
    this.showSearchBar = true;
    this.cd.detectChanges();

    if (this.subscription3 === null) {
      const sub = fromEvent(document, 'click').subscribe((event) => {
        const target = event.target as HTMLTextAreaElement;
        if ((target.parentElement === null && !target.classList.contains('searchBtn')) ||
          (target.parentElement !== null && !target.parentElement.classList.contains('searchbar-input-container') &&
            target.parentElement.id !== 'search')) {
          this.showSearchBar = false;
          this.subscription3.unsubscribe();
          this.subscription3 = null;
          this.cd.detectChanges();
        }
      });

      this.subscription3 = new Subscription();
      this.subscription3.add(sub);
    }

  }

  ngOnDestroy() {
    if (this.subscription3 != null) {
      this.subscription3.unsubscribe();
    }
  }

}
