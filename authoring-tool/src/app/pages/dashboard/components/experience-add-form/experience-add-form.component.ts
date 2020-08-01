import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { ExperienceModel, ToastService } from '../../../../core';

@Component({
  selector: 'app-experience-add-form',
  templateUrl: './experience-add-form.component.html',
  styleUrls: ['./experience-add-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperienceAddFormComponent implements OnInit {
  experience: ExperienceModel;
  form: FormGroup;
  defaultDate: string;
  isSubmitted = false;

  type: string;

  image: File = null;
  imagePath: any = '';
  originalImagePath: string;

  reader = new FileReader();

  constructor(
    private navParams: NavParams,
    public formBuilder: FormBuilder,
    private modalController: ModalController,
    public cd: ChangeDetectorRef,
    private toastService: ToastService) {
    this.type = navParams.get('type');
    if (this.type === 'update') {
      this.experience = navParams.get('experience');
    }
    this.defaultDate = this.getToday();
  }

  ngOnInit() {
    if (this.type === 'update') {
      this.form = this.formBuilder.group({
        title: [this.experience.title, [Validators.required, Validators.minLength(4)]],
        tags: [this.experience.tags, [Validators.required, Validators.minLength(4)]],
        description: [this.experience.description, [Validators.required, Validators.minLength(10)]],
        date: [this.experience.date],
      });
      this.imagePath = this.experience.image;
    } else {
      this.form = this.formBuilder.group({
        title: ['', [Validators.required, Validators.minLength(4)]],
        tags: ['', [Validators.required, Validators.minLength(4)]],
        description: ['', [Validators.required, Validators.minLength(10)]],
        date: [this.defaultDate],
      });
      this.imagePath = '';
    }

    this.originalImagePath = this.imagePath;

  }

  submitForm() {
    // Make sure to create a deep copy of the form-model
    // console.log(this.form.value);


    this.isSubmitted = true;
    if (!this.form.valid) {
      this.toastService.presentToast(`Please provide all the required values!`, 'danger');
      return false;
    } else {
      const result: ExperienceModel = Object.assign({}, this.form.value);
      const img = 'image';
      result[img] = this.imagePath;
      const published = 'published';
      if (this.experience == null) {
        result[published] = false;
      } else {
        result[published] = this.experience.published;
      }
      // console.log(result);

      const dat = { res: result, img: this.image };

      if (this.image != null && this.imagePath !== this.originalImagePath) {
        if (this.type === 'update') {
          const orig = 'originalPath';
          dat[orig] = this.originalImagePath;
        }
      }

      this.modalController.dismiss({
        data: dat
      }, 'confirm');

    }
  }

  closeModal() {
    // data null and role cancel
    this.modalController.dismiss(null, 'cancel');
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

  get errorControl() {
    return this.form.controls;
  }

  onFileChanged(event) {
    if (event.target.files != null && event.target.files.length > 0) {
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



}
