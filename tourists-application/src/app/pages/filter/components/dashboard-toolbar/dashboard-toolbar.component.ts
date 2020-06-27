import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dashboard-toolbar',
  templateUrl: './dashboard-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./dashboard-toolbar.component.scss'],
})
export class DashboardToolbarComponent implements OnInit {
  constructor() { }

  ngOnInit() { }

}
