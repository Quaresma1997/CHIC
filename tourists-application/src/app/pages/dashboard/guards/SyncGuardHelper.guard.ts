import { Injectable, Injector } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, UrlTree, RouterStateSnapshot } from '@angular/router';

import { concatMap, first } from 'rxjs/operators';
import { of, Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SyncGuardHelper implements CanActivate {
    public constructor(public injector: Injector) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return from(route.data.syncGuards).pipe(concatMap((value) => {
            const guard = this.injector.get(value);
            const result = guard.canActivate(route, state);
            if (result instanceof Observable) {
                return result;
            } else if (result instanceof Promise) {
                return from(result);
            } else {
                return of(result);
            }
        }), first((x) => x === false || x instanceof UrlTree, true));
    }
}
