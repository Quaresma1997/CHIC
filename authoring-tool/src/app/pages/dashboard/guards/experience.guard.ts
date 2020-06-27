import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { Store } from '@ngrx/store';
import * as store from '../../experience/store';

import { tap, filter, take, switchMap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Injectable()
export class ExperienceGuard implements CanActivate {
    constructor(private st: Store<store.DashboardState>) { }

    canActivate(): Observable<boolean> {
        return store.checkStoreExperiences(this.st).pipe(
            switchMap(() => of(true)),
            catchError(() => of(false))
        );
    }

}
