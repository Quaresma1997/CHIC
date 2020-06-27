import { Action } from '@ngrx/store';
import * as core from './../../../../core';


// export const LOAD_ACTIVITIES = 'LOAD_ACTIVITIES';
export const LOAD_ACTIVITIES_FAIL = 'LOAD_ACTIVITIES_FAIL';
export const LOAD_ACTIVITIES_SUCCESS = 'LOAD_ACTIVITIES_SUCCESS';

export const ADD_ACTIVITY = 'ADD_ACTIVITY';
export const ADD_ACTIVITY_FAIL = 'ADD_ACTIVITY_FAIL';
export const ADD_ACTIVITY_SUCCESS = 'ADD_ACTIVITY_SUCCESS';

export const UPDATE_ACTIVITY = 'UPDATE_ACTIVITY';
export const UPDATE_ACTIVITY_FAIL = 'UPDATE_ACTIVITY_FAIL';
export const UPDATE_ACTIVITY_SUCCESS = 'UPDATE_ACTIVITY_SUCCESS';

export const REMOVE_ACTIVITY = 'REMOVE_ACTIVITY';
export const REMOVE_ACTIVITY_FAIL = 'REMOVE_ACTIVITY_FAIL';
export const REMOVE_ACTIVITY_SUCCESS = 'REMOVE_ACTIVITY_SUCCESS';

/*export class LoadActivities implements Action {
    readonly type = LOAD_ACTIVITIES;
}*/

export class LoadActivitiesFail implements Action {
    readonly type = LOAD_ACTIVITIES_FAIL;
    constructor(public payload: any) { }
}

export class LoadActivitiesSuccess implements Action {
    readonly type = LOAD_ACTIVITIES_SUCCESS;
    constructor(public payload: core.ActivityModel[]) { }
}

export class AddActivity implements Action {
    readonly type = ADD_ACTIVITY;
    constructor(public payload: core.ActivityModel, public redo?: boolean, public undo?: boolean) { }
}

export class AddActivityFail implements Action {
    readonly type = ADD_ACTIVITY_FAIL;
    constructor(public payload: any) { }
}

export class AddActivitySuccess implements Action {
    readonly type = ADD_ACTIVITY_SUCCESS;
    constructor(public payload: core.ActivityModel) { }
}

export class UpdateActivity implements Action {
    readonly type = UPDATE_ACTIVITY;
    // tslint:disable-next-line:max-line-length
    constructor(public payload: { activity: core.ActivityModel, oldActivity: core.ActivityModel }, public redo?: boolean, public undo?: boolean) { }
}

export class UpdateActivityFail implements Action {
    readonly type = UPDATE_ACTIVITY_FAIL;
    constructor(public payload: any) { }
}

export class UpdateActivitySuccess implements Action {
    readonly type = UPDATE_ACTIVITY_SUCCESS;
    // tslint:disable-next-line:max-line-length
    constructor(public payload: { activity: core.ActivityModel, oldActivity: core.ActivityModel }, public redo?: boolean, public undo?: boolean) { }
}

export class RemoveActivity implements Action {
    readonly type = REMOVE_ACTIVITY;
    constructor(public payload: core.ActivityModel, public redo?: boolean, public undo?: boolean) { }
}

export class RemoveActivityFail implements Action {
    readonly type = REMOVE_ACTIVITY_FAIL;
    constructor(public payload: any) { }
}

export class RemoveActivitySuccess implements Action {
    readonly type = REMOVE_ACTIVITY_SUCCESS;
    constructor(public payload: core.ActivityModel) { }
}

export type ActivitiesAction =
    // | LoadActivities
    | LoadActivitiesFail
    | LoadActivitiesSuccess
    | AddActivity
    | AddActivityFail
    | AddActivitySuccess
    | RemoveActivity
    | RemoveActivityFail
    | RemoveActivitySuccess
    | UpdateActivity
    | UpdateActivityFail
    | UpdateActivitySuccess;

export type HistoryActivityAction =
    | AddActivity
    | UpdateActivity
    | RemoveActivity;
