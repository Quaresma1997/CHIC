import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { ExperienceModel } from '../../../../core';

@Component({
  selector: 'app-experience-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience-item.component.html',
  styleUrls: ['./experience-item.component.scss']
})
export class ExperienceItemComponent implements OnInit {
  @Input() experience: ExperienceModel;
  @Output() updateExperience: EventEmitter<ExperienceModel> = new EventEmitter();
  @Output() deleteExperience: EventEmitter<ExperienceModel> = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  callUpdateExperince() {
    this.updateExperience.emit(this.experience);
  }

  callDeleteExperince() {
    this.deleteExperience.emit(this.experience);
  }

}
