import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { Observable } from 'rxjs';

import * as core from './../../../../core';

@Component({
  selector: 'app-experience-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience-list.component.html',
  styleUrls: ['./experience-list.component.scss'],
})
export class ExperienceListComponent implements OnInit {
  @Input() experiences$: Observable<core.ExperienceModel[]>;

  constructor() { }

  ngOnInit() {
  }

}
