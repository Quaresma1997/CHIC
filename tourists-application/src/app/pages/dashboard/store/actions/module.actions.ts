import { Action } from '@ngrx/store';
import * as core from './../../../../core';


export const LOAD_MODULES = 'LOAD_MODULES';
export const LOAD_MODULES_FAIL = 'LOAD_MODULES_FAIL';
export const LOAD_MODULES_SUCCESS = 'LOAD_MODULES_SUCCESS';

export class LoadModules implements Action {
    readonly type = LOAD_MODULES;
}

export class LoadModulesFail implements Action {
    readonly type = LOAD_MODULES_FAIL;
    constructor(public payload: any) { }
}

export class LoadModulesSuccess implements Action {
    readonly type = LOAD_MODULES_SUCCESS;
    constructor(public payload: core.ModuleModel[]) { }
}

export type ModulesAction =
    | LoadModules
    | LoadModulesFail
    | LoadModulesSuccess;
