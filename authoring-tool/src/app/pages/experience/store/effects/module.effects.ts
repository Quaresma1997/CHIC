import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { switchMap, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { of, empty, Observable } from 'rxjs';

import * as navigation from './../../../../store';
import * as core from './../../../../core';
import * as actions from './../actions/module.actions';

@Injectable()
export class ModuleEffects {
    constructor(
        private actions$: Actions,
        private service: core.ModuleService
    ) { }

    @Effect()
    LoadModules$ = this.actions$.pipe(ofType(actions.LOAD_MODULES),
        switchMap(() =>
            this.service.getModules().pipe(
                map((modules: core.ModuleModel[]) => new actions.LoadModulesSuccess(modules)),
                catchError(error => of(new actions.LoadModulesFail(error)))
            )
        )
    );
/*
    @Effect()
    AddModule$ = this.actions$.pipe(ofType(actions.ADD_MODULE),
        map((action: actions.AddModule) => action.payload),
        switchMap((module: core.ModuleModel) =>
            this.service
                .addModule(module)
                .pipe(
                    map((mod: core.ModuleModel) => new actions.AddModuleSuccess(mod)),
                    catchError(error => of(new actions.AddModuleFail(error)))
                )
        )
    );

    @Effect()
    updateModule$ = this.actions$.pipe(ofType(actions.UPDATE_MODULE),
        map((action: actions.UpdateModule) => action.payload),
        switchMap(({ module, oldModule }) =>
            this.service
                .updateModule(module)
                .pipe(
                    map(() => new actions.UpdateModuleSuccess(module)),
                    catchError(error => of(new actions.UpdateModuleFail(error)))
                )
        )
    );


    @Effect()
    removeModule$ = this.actions$.pipe(ofType(actions.REMOVE_MODULE),
        map((action: actions.RemoveModule) => action.payload),
        switchMap((module: core.ModuleModel) =>
            this.service
                .deleteModule(module)
                .pipe(
                    map(() => new actions.RemoveModuleSuccess(module)),
                    catchError(error => of(new actions.RemoveModuleFail(error)))
                )
        )
    );
*/
}
