import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { switchMap, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { of, empty, Observable } from 'rxjs';

import * as navigation from './../../../../store';
import * as actions from './../actions/module.actions';
import { ModuleModel } from 'src/app/core/models';
import { ModuleService } from 'src/app/core/services';

@Injectable()
export class ModuleEffects {
    constructor(
        private actions$: Actions,
        private service: ModuleService
    ) { }

    @Effect()
    LoadModules$ = this.actions$.pipe(ofType(actions.LOAD_MODULES),
        switchMap(() =>
            this.service.getModules().pipe(
                map((modules: ModuleModel[]) => new actions.LoadModulesSuccess(modules)),
                catchError(error => of(new actions.LoadModulesFail(error)))
            )
        )
    );
}
