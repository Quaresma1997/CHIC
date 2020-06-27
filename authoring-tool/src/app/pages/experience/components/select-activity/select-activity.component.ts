import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import * as core from './../../../../core';

@Component({
  selector: 'app-select-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-activity.component.html',
  styleUrls: ['./select-activity.component.scss'],
})

export class SelectActivityComponent implements OnInit {
  @Input() activities: core.ActivityModel[];
  @Input() selectedActivityId: number;
  @Input() type: number;
  @Input() connection: core.ConnectionModel;
  @Input() possibleActivities: string[];
  @Input() numberOfConnections: number;

  @Output() createConnection: EventEmitter<any> = new EventEmitter();
  @Output() deleteConnection: EventEmitter<any> = new EventEmitter();
  @Output() addConnection: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    if (this.type === 0) {
      this.selectedActivityId = this.connection.sourceId;
    } else {
      this.selectedActivityId = this.connection.targetId;
    }
  }

  callAdd() {
    const newConnection: core.ConnectionModel = Object.assign({}, this.connection);
    let obj;
    if (this.type === 0) {
      newConnection.sourceId = this.selectedActivityId;
      // newConnection.edgeId = 'edge_s_' + this.selectedActivityId + '_t_' + this.thisActivityId;
      obj = { con: newConnection, prevSource: this.connection.sourceId };
    } else {
      newConnection.targetId = this.selectedActivityId;
      // newConnection.edgeId = 'edge_s_' + this.selectedActivityId + '_t_' + this.thisActivityId;
      obj = { con: newConnection, prevTarget: this.connection.targetId };
    }

    this.addConnection.emit(obj);
  }

  callCreate() {
    this.createConnection.emit();
  }

  callDelete() {
    // if (this.numberOfConnections > 1 || this.selectedActivityId == null || this.type === 1) {
      this.deleteConnection.emit(this.connection);
    // }
  }

  checkActivityAvailability(id) {
    return this.possibleActivities.indexOf(id) !== -1;
  }

}
