import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as store from './../../../experience/store';

@Component({
  selector: 'app-experience-add',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience-add.component.html',
  styleUrls: ['./experience-add.component.scss']
})
export class ExperienceAddComponent implements OnInit {
  @Output() openAddExperience: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }

  openForm() {
    this.openAddExperience.emit();
  }


}
