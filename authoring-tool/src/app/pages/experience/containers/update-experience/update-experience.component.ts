import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExperienceModel, UploadFileService, ToastService } from '../../../../core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as store from './../../../experience/store';

@Component({
  selector: 'app-update-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './update-experience.component.html',
  styleUrls: ['./update-experience.component.scss'],
})
export class UpdateExperienceComponent implements OnInit {
  @Output() saveForm: EventEmitter<ExperienceModel> = new EventEmitter();
  @Output() createDeleteListeners: EventEmitter<any> = new EventEmitter();
  @Output() removeDeleteListeners: EventEmitter<any> = new EventEmitter();

  hasChanges$: Observable<boolean>;

  experience: ExperienceModel;
  form: FormGroup;
  defaultDate: string;
  isSubmitted = false;

  image: File = null;
  imagePath: any;
  originalImagePath: string;

  reader = new FileReader();

  constructor(
    public formBuilder: FormBuilder, public cd: ChangeDetectorRef,
    private st: Store<store.DashboardState>,
    public uploadFileService: UploadFileService, private toastService: ToastService) {
    this.defaultDate = this.getToday();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: [this.experience.title, [Validators.required, Validators.minLength(4)]],
      tags: [this.experience.tags, [Validators.required, Validators.minLength(4)]],
      description: [this.experience.description, [Validators.required, Validators.minLength(10)]],
      date: [this.experience.date],
    });
    this.hasChanges$ = this.st.pipe(select(store.getExperiencesHasChanges));

    this.imagePath = this.experience.image;
    this.originalImagePath = this.imagePath;

  }

  async saveExperience() {

    this.isSubmitted = true;
    if (!this.form.valid) {
      this.toastService.presentToast(`Please provide all the required values!`, 'danger');
      return false;
    } else {
      const newExperience: ExperienceModel = Object.assign({}, this.form.value);
      newExperience.published = this.experience.published;
      newExperience.id = this.experience.id;
      newExperience.activities = this.experience.activities;
      newExperience.connections = this.experience.connections;
      newExperience.image = this.imagePath;
      if (this.image != null && this.imagePath !== this.originalImagePath) {
        const img = 'image';
        // this.uploadFileService.deleteFile(this.originalImagePath);
        await this.uploadFileService.uploadFile(this.image, 'experienceImages');
        await this.uploadFileService.getUrl().then(() => newExperience[img] = this.uploadFileService.url);
        this.imagePath = newExperience[img];
        this.originalImagePath = newExperience[img];
        this.image = null;
      }
      // console.log(newExperience);
      this.experience = newExperience;
      this.cd.detectChanges();
      this.saveForm.emit(newExperience);
    }
  }


  getToday(): string {
    const date = new Date();
    return this.getDateString(date);
  }

  getDate(e) {
    const date = this.getDateString(new Date(e.target.value));

    this.form.get('date').setValue(date);
  }

  getDateString(date) {
    const mm = (date.getMonth() + 1).toString();
    const dd = date.getDate().toString();

    return date.getFullYear() + '-' + (mm.length === 2 ? '' : '0') + mm + '-' + (dd.length === 2 ? '' : '0') + dd;
  }


  onFileChanged(event) {
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;

      if (!file.type.includes('image')) {
        return;
      }

      this.image = file;
      this.reader.readAsDataURL(file);
      this.reader.onload = () => {
        this.imagePath = this.reader.result;
        this.cd.detectChanges();
      };
    }
  }

  get errorControl() {
    return this.form.controls;
  }

}
