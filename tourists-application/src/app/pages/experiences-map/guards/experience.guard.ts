import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { Store } from '@ngrx/store';
import * as store from '../../dashboard/store';

import { tap, filter, take, switchMap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

export interface ComponentCanDeactivate {
    // canDeactivate: () => boolean | Observable<boolean>;
    destroy: () => any;
}

@Injectable()
export class ExperienceGuard implements CanActivate {
    constructor(private st: Store<store.DashboardState>) { }

    canActivate(): Observable<boolean> {
        return store.checkStoreExperiences(this.st).pipe(
            switchMap(() => of(true)),
            catchError(() => of(false))
        );
    }
    canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
        component.destroy();
        return true;
    }

}
