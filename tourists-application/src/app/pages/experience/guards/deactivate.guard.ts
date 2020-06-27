import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, ActivatedRouteSnapshot } from '@angular/router';

import { Store } from '@ngrx/store';
import * as store from '../../dashboard/store';

import { tap, filter, take, switchMap, catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { ExperienceModel } from 'src/app/core';

export interface ComponentCanDeactivate {
    // canDeactivate: () => boolean | Observable<boolean>;
    destroy: () => any;
}

@Injectable()
export class ActivityGuard implements CanDeactivate<ComponentCanDeactivate> {
    constructor(private st: Store<store.DashboardState>) { }

    canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
        component.destroy();
        return true;

    }
}


