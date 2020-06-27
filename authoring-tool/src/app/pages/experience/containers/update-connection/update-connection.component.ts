import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivityModel, ConnectionModel } from '../../../../core';

@Component({
  selector: 'app-update-connection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './update-connection.component.html',
  styleUrls: ['./update-connection.component.scss'],
})
export class UpdateConnectionComponent implements OnInit {
  @Output() removeThis: EventEmitter<any> = new EventEmitter();
  @Output() closeForm: EventEmitter<any> = new EventEmitter();
  connection: ConnectionModel;
  activitySource: ActivityModel;
  activityTarget: ActivityModel;
  constructor() { }

  ngOnInit() { }


  closeThis() {
    this.closeForm.emit();
  }

  remove() {
    this.removeThis.emit();
  }

}
