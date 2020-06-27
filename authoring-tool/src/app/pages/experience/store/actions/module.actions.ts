import { Action } from '@ngrx/store';
import * as core from './../../../../core';


export const LOAD_MODULES = 'LOAD_MODULES';
export const LOAD_MODULES_FAIL = 'LOAD_MODULES_FAIL';
export const LOAD_MODULES_SUCCESS = 'LOAD_MODULES_SUCCESS';

// export const ADD_MODULE = 'ADD_MODULE';
// export const ADD_MODULE_FAIL = 'ADD_MODULE_FAIL';
// export const ADD_MODULE_SUCCESS = 'ADD_MODULE_SUCCESS';

// export const UPDATE_MODULE = 'UPDATE_MODULE';
// export const UPDATE_MODULE_FAIL = 'UPDATE_MODULE_FAIL';
// export const UPDATE_MODULE_SUCCESS = 'UPDATE_MODULE_SUCCESS';

// export const REMOVE_MODULE = 'REMOVE_MODULE';
// export const REMOVE_MODULE_FAIL = 'REMOVE_MODULE_FAIL';
// export const REMOVE_MODULE_SUCCESS = 'REMOVE_MODULE_SUCCESS';

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

// export class AddModule implements Action {
//     readonly type = ADD_MODULE;
//     redo = false;
//     undo = false;
//     id: number;
//     experienceId: number;
//     constructor(public payload: core.ModuleModel) { }
// }

// export class AddModuleFail implements Action {
//     readonly type = ADD_MODULE_FAIL;
//     constructor(public payload: any) { }
// }

// export class AddModuleSuccess implements Action {
//     readonly type = ADD_MODULE_SUCCESS;
//     constructor(public payload: core.ModuleModel) { }
// }

// export class UpdateModule implements Action {
//     readonly type = UPDATE_MODULE;
//     redo = false;
//     undo = false;
//     id: number;
//     experienceId: number;
//     constructor(public payload: { module: core.ModuleModel, oldModule: core.ModuleModel }) { }
// }

// export class UpdateModuleFail implements Action {
//     readonly type = UPDATE_MODULE_FAIL;
//     constructor(public payload: any) { }
// }

// export class UpdateModuleSuccess implements Action {
//     readonly type = UPDATE_MODULE_SUCCESS;
//     constructor(public payload: core.ModuleModel) { }
// }

// export class RemoveModule implements Action {
//     readonly type = REMOVE_MODULE;
//     redo = false;
//     undo = false;
//     id: number;
//     experienceId: number;
//     constructor(public payload: core.ModuleModel) { }
// }

// export class RemoveModuleFail implements Action {
//     readonly type = REMOVE_MODULE_FAIL;
//     constructor(public payload: any) { }
// }

// export class RemoveModuleSuccess implements Action {
//     readonly type = REMOVE_MODULE_SUCCESS;
//     constructor(public payload: core.ModuleModel) { }
// }

export type ModulesAction =
    | LoadModules
    | LoadModulesFail
    | LoadModulesSuccess;
    // | AddModule
    // | AddModuleFail
    // | AddModuleSuccess
    // | RemoveModule
    // | RemoveModuleFail
    // | RemoveModuleSuccess
    // | UpdateModule
    // | UpdateModuleFail
    // | UpdateModuleSuccess;

