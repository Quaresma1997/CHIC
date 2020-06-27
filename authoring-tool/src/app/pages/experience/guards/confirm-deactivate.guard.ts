import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

export interface ComponentCanDeactivate {
    canDeactivate: () => boolean | Observable<boolean>;
    destroy: () => any;
}

@Injectable()
export class ConfirmDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {
    constructor() {
    }

    canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
        if (component.canDeactivate()) {
            component.destroy();
            return true;
        } else {
            const result = confirm('Warning: Do you want to leave without saving? Any changes made will be lost!');
            if (result) {
                component.destroy();
                return true;
            } else {
                console.log('Don\'t leave');
            }
        }





    }
    /*
        async presentLeaveAlertConfirm() {
            let response;
            const alert = await this.alertController.create({
                header: 'Warning',
                message: 'Tem a certeza que pretende sair sem guardar? Quaisquer alterações realizadas serão perdidas.',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            alert.dismiss(false);
                            return false;
                        }
                    }, {
                        text: 'Confirm',
                        handler: () => {
                            // this.deleteActivityOrConnection();
                            alert.dismiss(true);
                            return false;

                        }
                    }
                ]
            });
            await alert.present();
            await alert.onDidDismiss().then((data) => {
                response = data.data;
            });
            return response;
        }*/
}
