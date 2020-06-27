import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

import { select, Store } from '@ngrx/store';

import * as core from './../../../../core';
import * as store from './../../../experience/store';
import { ExperienceAddFormComponent } from '../../components';
import { ExperienceModel, UploadFileService, ToastService } from './../../../../core';

@Component({
  selector: 'app-experience-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience-list.component.html',
  styleUrls: ['./experience-list.component.scss'],
})
export class ExperienceListComponent implements OnInit {
  @Input() experiences$: Observable<core.ExperienceModel[]>;

  constructor(
    private st: Store<store.DashboardState>,
    public cd: ChangeDetectorRef,
    private uploadFileService: UploadFileService,
    public modalController: ModalController,
    public alertController: AlertController) { }

  ngOnInit() {
  }

  onOpenAddExperience() {
    this.presentAddExperienceModal();
  }

  async presentAddExperienceModal() {
    const modal = await this.modalController.create({
      component: ExperienceAddFormComponent,
      componentProps: { type: 'add' },
    });

    modal.onDidDismiss()
      .then((result) => {
        if (result.role === 'confirm') {
          const newExperience = result.data.data.res as ExperienceModel;
          newExperience.activities = [];
          newExperience.connections = [];
          this.addExperience(newExperience, result.data.data.img);
        }
      });

    return await modal.present();
  }


  async presentUpdateExperienceModal(exp: core.ExperienceModel) {
    const modal = await this.modalController.create({
      component: ExperienceAddFormComponent,
      componentProps: { experience: exp, type: 'update' },
    });

    modal.onDidDismiss()
      .then((result) => {
        if (result.role === 'confirm') {

          const newExperience = result.data.data.res as ExperienceModel;
          newExperience.activities = exp.activities;
          newExperience.connections = exp.connections;
          newExperience.id = exp.id;
          this.updateExperience(newExperience, result.data.data.img, result.data.data.originalPath);
        }
      });

    return await modal.present();
  }

  async addExperience(experience: ExperienceModel, image: File) {
    const img = 'image';
    const newExperience: ExperienceModel = Object.assign({}, experience);
    if (image != null) {
      await this.uploadFileService.uploadFile(image, 'experienceImages');
      await this.uploadFileService.getUrl().then(() => newExperience[img] = this.uploadFileService.url);
    }
    this.st.dispatch(new store.CreateExperience(newExperience));
  }

  async updateExperience(experience: core.ExperienceModel, image: File, originalPath: string) {
    // console.log(image, originalPath);
    const newExperience: ExperienceModel = Object.assign({}, experience);
    if (image != null) {
      const img = 'image';
      // this.uploadFileService.deleteFile(originalPath);
      await this.uploadFileService.uploadFile(image, 'experienceImages');
      await this.uploadFileService.getUrl().then(() => newExperience[img] = this.uploadFileService.url);

    }
    this.st.dispatch(new store.UpdateExperience(newExperience));
  }

  deleteExperience(exp) {
    this.st.dispatch(new store.DeleteExperience(exp.id));
  }

  removeItem(exp) {
    this.presentAlertConfirm(exp);
  }

  async presentAlertConfirm(exp) {
    const alert = await this.alertController.create({
      header: 'Warning!',
      message: 'Do you want to delete this experience?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'cancelBtn alertBtn',
          handler: () => {
          }
        }, {
          text: 'Confirm',
          cssClass: 'confirmBtn alertBtn',
          handler: () => {
            this.deleteExperience(exp);
          }
        }
      ]
    });

    await alert.present();
  }
}
