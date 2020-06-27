import { Action } from '@ngrx/store';
import * as core from './../../../../core';


// export const LOAD_ACTIVITIES = 'LOAD_ACTIVITIES';
export const LOAD_ACTIVITIES_FAIL = 'LOAD_ACTIVITIES_FAIL';
export const LOAD_ACTIVITIES_SUCCESS = 'LOAD_ACTIVITIES_SUCCESS';

export const SET_ACTIVITIES_AVAILABLE = 'SET_ACTIVITIES_AVAILABLE';
export const CLEAR_ACTIVITIES_AVAILABLE = 'CLEAR_ACTIVITIES_AVAILABLE';

export const REMOVE_ACTIVITIES_AVAILABLE = 'REMOVE_ACTIVITIES_AVAILABLE';

export const UPDATE_ACTIVITY = 'UPDATE_ACTIVITY';

export const SET_ACTIVITY_COMPLETED = 'SET_ACTIVITY_COMPLETED';

export const SET_ACTIVITY_GOALS = 'SET_ACTIVITY_GOALS';

export const SET_INITIAL_ACTIVITY_COMPLETED = 'SET_INITIAL_ACTIVITY_COMPLETED';

export const SET_INITIAL_ACTIVITY_GOALS = 'SET_INITIAL_ACTIVITY_GOALS';

export const MARK_ACTIVITY_GOAL_COMPLETED = 'MARK_ACTIVITY_GOAL_COMPLETED';

export const SET_ACTIVITIES_SEQUENCE = 'SET_ACTIVITIES_SEQUENCE';

export const CLEAR_ACTIVITIES_SEQUENCE = 'CLEAR_ACTIVITIES_SEQUENCE';

export class LoadActivitiesFail implements Action {
    readonly type = LOAD_ACTIVITIES_FAIL;
    constructor(public payload: any) { }
}

export class LoadActivitiesSuccess implements Action {
    readonly type = LOAD_ACTIVITIES_SUCCESS;
    constructor(public payload: core.ActivityModel[]) { }
}

export class SetActivitesAvailable implements Action {
    readonly type = SET_ACTIVITIES_AVAILABLE;
    constructor(public payload: core.ActivityModel[]) { }
}

export class ClearActivitesAvailable implements Action {
    readonly type = CLEAR_ACTIVITIES_AVAILABLE;
    constructor() { }
}

export class RemoveActivitesAvailable implements Action {
    readonly type = REMOVE_ACTIVITIES_AVAILABLE;
    constructor(public payload: number[]) { }
}


export class SetActivityCompleted implements Action {
    readonly type = SET_ACTIVITY_COMPLETED;
    constructor(public payload: boolean, public id: number) { }
}

export class SetActivityGoals implements Action {
    readonly type = SET_ACTIVITY_GOALS;
    constructor(public payload: boolean[], public id: number) { }
}

export class SetInitialActivityCompleted implements Action {
    readonly type = SET_INITIAL_ACTIVITY_COMPLETED;
    constructor(public payload: boolean, public id: number) { }
}

export class SetInitialActivityGoals implements Action {
    readonly type = SET_INITIAL_ACTIVITY_GOALS;
    constructor(public payload: boolean[], public id: number) { }
}

export class MarkActivityGoalCompleted implements Action {
    readonly type = MARK_ACTIVITY_GOAL_COMPLETED;
    constructor(public goal: number, public id: number) { }
}

export class UpdateActivity implements Action {
    readonly type = UPDATE_ACTIVITY;
    constructor(public blocked: boolean, public distance: number, public id: number) { }
}

export class SetActivitesSequence implements Action {
    readonly type = SET_ACTIVITIES_SEQUENCE;
    constructor(public payload: core.ActivityModel) { }
}

export class ClearActivitesSequence implements Action {
    readonly type = CLEAR_ACTIVITIES_SEQUENCE;
    constructor() { }
}

export type ActivitiesAction =
    // | LoadActivities
    | LoadActivitiesFail
    | LoadActivitiesSuccess
    | UpdateActivity
    | SetActivityCompleted
    | SetActivityGoals
    | MarkActivityGoalCompleted
    | SetActivitesAvailable
    | SetInitialActivityCompleted
    | SetInitialActivityGoals
    | RemoveActivitesAvailable
    | ClearActivitesAvailable
    | SetActivitesSequence
    | ClearActivitesSequence;
