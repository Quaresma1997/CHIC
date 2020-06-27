import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-audio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit {
  @Input() audio: any;
  audioPlaying: boolean;
  @Output() stopAllAudios: EventEmitter<any> = new EventEmitter();
  constructor(
    public cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {

    this.audioPlaying = false;
  }

  playAudio() {
    this.stopAllAudios.emit();
    this.audio.play();
    this.audioPlaying = true;
    this.cd.detectChanges();
  }

  stopAudio() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audioPlaying = false;
    this.cd.detectChanges();
  }
}
