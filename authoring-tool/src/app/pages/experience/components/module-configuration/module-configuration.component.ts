import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MapModalComponent } from '../map-modal/map-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-module-configuration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './module-configuration.component.html',
  styleUrls: ['./module-configuration.component.scss'],
})
export class ModuleConfigurationComponent implements OnInit {
  @Input() moduleConfig: any;
  @Input() moduleData: any;
  @Input() coords: {};
  @Input() moduleDataChange: boolean;
  @Output() createDeleteListeners: EventEmitter<any> = new EventEmitter();
  @Output() removeDeleteListeners: EventEmitter<any> = new EventEmitter();

  myFormGroup: FormGroup;
  selectedFile: File;

  isSubmitted = false;

  images: {};
  videos: {};
  audios: {};

  imageInfos: {};
  videoInfos: {};
  audioInfos: {};

  locations: {};

  textAreaConfig: any[];
  textBoxConfig: any[];
  numberConfig: any[];
  selectConfig: any[];
  imageConfig: any[];
  videoConfig: any[];
  audioConfig: any[];
  locationConfig: any[];

  removedFiles: {};

  reader = new FileReader();

  constructor(public cd: ChangeDetectorRef, public modalController: ModalController, ) { }

  ngOnInit() {
    this.setModuleContent();
  }

  setModuleContent() {
    const group = {};

    if (this.moduleConfig != null) {
      this.isSubmitted = false;

      this.images = {};
      this.videos = {};
      this.audios = {};

      this.imageInfos = {};
      this.videoInfos = {};
      this.audioInfos = {};

      this.locations = {};

      this.textAreaConfig = [];
      this.textBoxConfig = [];
      this.numberConfig = [];
      this.selectConfig = [];
      this.imageConfig = [];
      this.videoConfig = [];
      this.audioConfig = [];
      this.locationConfig = [];

      this.removedFiles = {};



      if (this.moduleData != null && !this.moduleDataChange) {
        this.moduleConfig.forEach(input => {
          let value = '';
          switch (input.type) {
            case 'image':
              this.imageInfos[input.label] = this.moduleData[input.label];
              this.imageConfig.push(input);
              break;
            case 'video':
              this.videoInfos[input.label] = this.moduleData[input.label];
              this.videoConfig.push(input);
              break;
            case 'audio':
              this.audioInfos[input.label] = this.moduleData[input.label];
              this.audioConfig.push(input);
              break;
            case 'textArea':
              value = this.moduleData[input.label];
              this.textAreaConfig.push(input);
              break;
            case 'textBox':
              value = this.moduleData[input.label];
              this.textBoxConfig.push(input);
              break;
            case 'number':
              value = this.moduleData[input.label];
              this.numberConfig.push(input);
              break;
            case 'select':
              value = this.moduleData[input.label];
              this.selectConfig.push(input);
              break;
            case 'location':
              this.locations[input.label] = this.moduleData[input.label];
              this.locationConfig.push(input);
              break;
            default:
              console.log('TYPE NOT CAUGHT');
              break;
          }
          if (input.type !== 'location') {
            group[input.label] = new FormControl(value);
          }

        });
      } else {
        this.moduleConfig.forEach(input => {
          switch (input.type) {
            case 'image':
              this.imageInfos[input.label] = null;
              this.imageConfig.push(input);
              break;
            case 'video':
              this.videoInfos[input.label] = null;
              this.videoConfig.push(input);
              break;
            case 'audio':
              this.audioInfos[input.label] = null;
              this.audioConfig.push(input);
              break;
            case 'textArea':
              this.textAreaConfig.push(input);
              break;
            case 'textBox':
              this.textBoxConfig.push(input);
              break;
            case 'number':
              this.numberConfig.push(input);
              break;
            case 'select':
              this.selectConfig.push(input);
              break;
            case 'location':
              this.locations[input.label] = null;
              this.locationConfig.push(input);
              break;
            default:
              console.log('TYPE NOT CAUGHT');
              break;
          }
          if (input.type !== 'location') {
            group[input.label] = new FormControl('');
          }
        });
      }
    }

    this.myFormGroup = new FormGroup(group);

    this.cd.detectChanges();
  }

  removeFile(type, label, element) {
    switch (type) {
      case 'image':
        this.removedFiles[label] = this.imageInfos[label].url;
        this.imageInfos[label] = null;
        delete this.images[label];
        break;
      case 'audio':
        this.removedFiles[label] = this.audioInfos[label].url;
        this.audioInfos[label] = null;
        delete this.audios[label];
        break;
      case 'video':
        this.removedFiles[label] = this.videoInfos[label].url;
        this.videoInfos[label] = null;
        delete this.videos[label];
        break;
      default:
        break;
    }
    element.value = '';
    this.cd.detectChanges();
  }

  onFileChanged(event, element: HTMLElement) {
    if (event.target.files != null && event.target.files.length > 0) {
      const [file] = event.target.files;
      const label = element.getAttribute('data-label');

      switch (element.getAttribute('data-type')) {
        case 'image':
          if (!file.type.includes('image')) {
            return;
          }
          this.images[label] = file;
          this.reader.readAsDataURL(file);
          this.reader.onload = () => {
            this.imageInfos[label] = { url: this.reader.result, name: file.name };
            this.cd.detectChanges();
          };

          break;
        case 'video':
          if (!file.type.includes('video')) {
            return;
          }
          this.videos[label] = file;
          this.reader.readAsDataURL(file);
          this.reader.onload = () => {
            this.videoInfos[label] = { url: this.reader.result, name: file.name };
            this.cd.detectChanges();
          };
          break;
        case 'audio':
          if (!file.type.includes('audio')) {
            return;
          }
          this.audios[label] = file;
          this.reader.readAsDataURL(file);
          this.reader.onload = () => {
            this.audioInfos[label] = { url: this.reader.result, name: file.name };
            this.cd.detectChanges();
          };
          break;
        default:
          break;
      }
      // console.log(this.removedFiles[label]);
      if (this.removedFiles[label] != null) {
        delete this.removedFiles[label];
      }

      // console.log(file);

    }
  }

  validate(): boolean {
    if (this.validateMedia()) {
      return true;
    }

    for (const input of this.moduleConfig) {
      if (input.type !== 'image' && input.type !== 'video' && input.type !== 'audio') {
        if (this.myFormGroup.value[input.label] != null && this.myFormGroup.value[input.label] !== '') {
          return true;
        }
      }

    }

    return false;
  }

  validateLocationsImgs(): boolean {
    if (Object.keys(this.locations).length > 0) {
      const len = Object.keys(this.imageInfos).length;
      const imgKeys = Object.keys(this.imageInfos);
      const locKeys = Object.keys(this.locations);
      for (let i = 0; i < len; i++) {
        if ((this.imageInfos[imgKeys[i]] != null && this.locations[locKeys[i]] == null)
          || (this.imageInfos[imgKeys[i]] == null && this.locations[locKeys[i]] != null)) {
          return false;
        }
      }
    }

    return true;
  }


  validateMedia(): boolean {
    for (const img of Object.keys(this.imageInfos)) {
      if (this.imageInfos[img] != null) {
        return true;
      }
    }

    for (const video of Object.keys(this.videoInfos)) {
      if (this.videoInfos[video] != null) {
        return true;
      }
    }

    for (const audio of Object.keys(this.audioInfos)) {
      if (this.audioInfos[audio] != null) {
        return true;
      }
    }

    for (const location of Object.keys(this.locations)) {
      if (this.locations[location] != null) {
        return true;
      }
    }

    return false;
  }

  getValue(): {} {
    const newData = Object.assign({}, this.myFormGroup.value);

    Object.keys(this.imageInfos).forEach(img => {
      newData[img] = this.imageInfos[img];
    });

    Object.keys(this.videoInfos).forEach(video => {
      newData[video] = this.videoInfos[video];
    });


    Object.keys(this.audioInfos).forEach(audio => {
      newData[audio] = this.audioInfos[audio];
    });

    Object.keys(this.locations).forEach(location => {
      newData[location] = this.locations[location];
    });
    return newData;
  }

  async selectLocation(label) {

    const modal = await this.modalController.create({
      component: MapModalComponent,
      componentProps: { coords: this.coords, location: this.locations[label] },
      cssClass: 'modalMap',
    });
    modal.onDidDismiss()
      .then((result) => {
        if (result.role === 'confirm') {
          this.locations[label] = result.data.data;
          this.cd.detectChanges();
        } else {
          console.log('Stopped Preview');
        }
      });
    return await modal.present();
  }

  removeLocation(label) {
    this.locations[label] = null;
    this.cd.detectChanges();
  }


}
