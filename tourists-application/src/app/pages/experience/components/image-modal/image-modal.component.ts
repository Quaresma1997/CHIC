import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss'],
})
export class ImageModalComponent implements OnInit {
  @Input() img: any;
  constructor(
    private modalController: ModalController,
  ) {
  }

  ngOnInit() { }

  leave(ev) {
    this.modalController.dismiss('confirm');
  }

}
