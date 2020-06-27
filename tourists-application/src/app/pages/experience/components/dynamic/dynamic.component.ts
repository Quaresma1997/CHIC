import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AudioComponent } from '../audio/audio.component';

@Component({
  selector: 'app-dynamic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.scss'],
})
export class DynamicComponent implements OnInit {
  @Input() type: string;
  @Input() data: any;
  @Input() proximity: any;
  @Input() time: any;
  @Input() location: any;
  userLocation: {};

  @Input()
  set setLocation(location) {
    this.userLocation = location;
    this.cd.detectChanges();
  }

  @Output() stopAllAudios: EventEmitter<any> = new EventEmitter();

  @ViewChild(AudioComponent) audio: AudioComponent;
  audioPlaying: boolean;
  constructor(public cd: ChangeDetectorRef) { }

  ngOnInit() { }

  stopAudio() {
    if (this.audio != null) {
      this.audio.audioPlaying = false;
      this.audio.cd.detectChanges();
    }
  }

}
