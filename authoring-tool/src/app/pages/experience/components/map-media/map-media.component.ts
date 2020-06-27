import {
  Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef,
  Input, ChangeDetectorRef, OnDestroy, AfterViewInit, AfterViewChecked
} from '@angular/core';
import * as L from 'leaflet';
import { ToastService } from 'src/app/core';

@Component({
  selector: 'app-map-media',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-media.component.html',
  styleUrls: ['./map-media.component.scss'],
})
export class MapMediaComponent implements OnInit, AfterViewChecked {
  @ViewChild('imgsDiv') imgsDiv: ElementRef;
  @Input() media: any;
  @Input() time: number;

  currentImgsWidth: number;
  totalImgsWidth: number;
  imgsWidth: number;

  constructor(
    public cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    if (this.media.length == null) {
      this.media = [this.media];
    }
    if (this.time == null) {
      this.time = 0;
    }
    this.totalImgsWidth = 100 + this.media.length * 116;
    this.currentImgsWidth = 0;
  }

  ngAfterViewChecked() {
    setTimeout(() => {
      this.imgsWidth = this.imgsDiv.nativeElement.clientWidth;
    }, 200);
  }

  move(event, right) {
    const imgs = event.target.parentNode.children[0].children;
    if (right) {
      this.currentImgsWidth += 116;
    } else {
      this.currentImgsWidth -= 116;
    }
    if (this.currentImgsWidth > 0) {
      this.currentImgsWidth = 0;
      return;
    } else if (this.imgsWidth - this.currentImgsWidth > this.totalImgsWidth + 116) {
      this.currentImgsWidth += 116;
      return;
    }
    for (const img of imgs) {
      img.style.webkitTransform =
        img.style.transform =
        'translate(' + this.currentImgsWidth + 'px)';
    }

  }

}
