import {
  Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy,
  ChangeDetectorRef, ViewChildren, QueryList, ElementRef, ViewChild, ComponentFactoryResolver, AfterViewInit
} from '@angular/core';
import * as store from './../../../experience/store';
import * as core from './../../../../core';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { AudioComponent } from '../audio/audio.component';
import { ContentViewerComponent } from '../../dynamic-content-viewer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-preview-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './preview-activity.component.html',
  styleUrls: ['./preview-activity.component.scss'],
})
export class PreviewActivityComponent implements OnInit {
  @Input() activity: core.ActivityModel;
  @Input() module: core.ModuleModel;

  constructor() { }

  ngOnInit() { }

}
