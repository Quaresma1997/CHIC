import { Injectable } from '@angular/core';

import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ToastService {
    constructor(private toastController: ToastController) {
    }

    async presentToast(msg: string, col: string) {
        const toast = await this.toastController.create({
            message: msg,
            duration: 3000,
            color: col,
            buttons: [
                {
                    icon: 'close',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        toast.present();
    }

}
