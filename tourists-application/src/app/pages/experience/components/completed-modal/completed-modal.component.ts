import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-completed-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './completed-modal.component.html',
  styleUrls: ['./completed-modal.component.scss'],
})
export class CompletedModalComponent implements OnInit {
  @Input() completed: boolean;
  constructor(public modalController: ModalController) { }

  ngOnInit() { console.log(this.completed); }

  leave(leave) {
    if (leave) {
      this.modalController.dismiss('confirm');
    } else {
      this.modalController.dismiss('cancel');
    }
  }

}
