import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dashboard-toolbar',
  templateUrl: './dashboard-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./dashboard-toolbar.component.scss'],
})
export class DashboardToolbarComponent implements OnInit {
  @Output() searchExperiences: EventEmitter<any> = new EventEmitter();
  query: string;
  constructor() { }

  ngOnInit() { }

  search() {
    this.searchExperiences.emit(this.query.trim());
  }

  getExperiences(ev: any) {
    const query = ev.target.value;
    this.searchExperiences.emit(query.trim());
  }

}
