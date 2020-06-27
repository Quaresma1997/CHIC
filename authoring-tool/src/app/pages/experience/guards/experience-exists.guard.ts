import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';

import { Store } from '@ngrx/store';
import * as store from '../../experience/store';

import { tap, filter, take, map, switchMap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { ExperienceModel } from '../../../core';

@Injectable()
export class ExperienceExistsGuard implements CanActivate {
    constructor(private st: Store<store.DashboardState>) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return store.checkStoreExperiences(this.st).pipe(
            switchMap(() => {
                const id = route.params.id;
                return this.hasExperience(id);
            })
        );
    }

    hasExperience(id: string): Observable<boolean> {
        return this.st
            .select(store.getExperienceEntities)
            .pipe(
                map((entities: { [key: string]: ExperienceModel }) => !!entities[id]),
                take(1)
            );
    }

}

