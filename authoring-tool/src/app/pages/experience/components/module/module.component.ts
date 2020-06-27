import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ModuleModel } from '../../../../core';

@Component({
  selector: 'app-module',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss'],
})
export class ModuleComponent implements OnInit {
  @Input() module: ModuleModel;
  @Input() selected: boolean;
  constructor() { }

  ngOnInit() {
  }

}
