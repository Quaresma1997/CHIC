import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { tap, finalize } from 'rxjs/operators';
import { AngularFireUploadTask } from '@angular/fire/storage/task';

import { ToastService } from './toast.service';

declare const ImageTools: any;

@Injectable({ providedIn: 'root' })
export class UploadFileService {
    task: AngularFireUploadTask;
    url = '';
    snap: any;
    kaka: any;

    constructor(
        private storage: AngularFireStorage,
        private toastService: ToastService) {
        this.snap = null;
    }

    async uploadFile(file, type) {
        // if (this.file) {
        let fileBlob;

        const loaded = new Promise(resolve => {
            ImageTools.resize(file, {
                width: 480, // maximum width
                height: 480 // maximum height
            }, async (blob, didItResize) => {
                fileBlob = blob;

                // console.log(fileBlob, file);

                const newFile = new File([fileBlob], file.name, {
                    type: fileBlob.type,
                });

                // console.log(newFile);
                const filePath = `${type}/${Date.now()}_${newFile.name}`;
                const newMetadata = {
                    cacheControl: 'public,max-age=604800',
                };
                await this.storage.upload(filePath, newFile, newMetadata).then((snap) => {
                    this.snap = snap;
                    // console.log(snap);
                }).catch((error) => {
                    this.toastService.presentToast(`Error uploading ${newFile.name}!`, 'danger');
                    console.log(error);
                });

                resolve();
            });
        });
        await loaded;
    }

    deleteFile(url) {
        let ref = null;
        try {
            ref = this.storage.storage.refFromURL(url);
        } catch (error) {
            console.log(error);
        }
        if (ref != null) {
            ref.delete().then(() => {
                // console.log('DELETED SUCCESSFULLY');
            }).catch((error) => {
                this.toastService.presentToast(`Error deleting file!`, 'danger');
                console.log(error);
            });
        }

    }


    async getUrl() {
        if (this.snap != null) {
            await this.snap.ref.getDownloadURL().then((url) => {
                this.url = url;
                // console.log(url);
            }).catch((error) => {
                console.log(error);
            });
        }

    }

    // getUrl(): string {
    //     return this.url;
    // }

}
