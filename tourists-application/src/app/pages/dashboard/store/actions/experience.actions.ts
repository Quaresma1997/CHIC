import { Action } from '@ngrx/store';
import * as core from './../../../../core';

export const LOAD_EXPERIENCES = 'LOAD_EXPERIENCES';
export const LOAD_EXPERIENCES_FAIL = 'LOAD_EXPERIENCES_FAIL';
export const LOAD_EXPERIENCES_SUCCESS = 'LOAD_EXPERIENCES_SUCCESS';

export const SET_EXPERIENCE_COMPLETED = 'SET_EXPERIENCE_COMPLETED';

export const SET_EXPERIENCE_FAVOURITE = 'SET_EXPERIENCE_FAVOURITE';

export const SET_EXPERIENCE_ACTIVITY_COMPLETED = 'SET_EXPERIENCE_ACTIVITY_COMPLETED';

export const SET_EXPERIENCE_LOCATION = 'SET_EXPERIENCE_LOCATION';

export const SET_EXPERIENCE_ORDER = 'SET_EXPERIENCE_ORDER';
export const SET_EXPERIENCE_FILTERS = 'SET_EXPERIENCE_FILTERS';

export const UPDATE_EXPERIENCE = 'UPDATE_EXPERIENCE';
export const UPDATE_EXPERIENCE_FAIL = 'UPDATE_EXPERIENCE_FAIL';
export const UPDATE_EXPERIENCE_SUCCESS = 'UPDATE_EXPERIENCE_SUCCESS';

export const SET_HAS_CHANGES = 'SET_HAS_CHANGES';

export class LoadExperiences implements Action {
    readonly type = LOAD_EXPERIENCES;
}

export class LoadExperiencesFail implements Action {
    readonly type = LOAD_EXPERIENCES_FAIL;
    constructor(public payload: any) { }
}

export class LoadExperiencesSuccess implements Action {
    readonly type = LOAD_EXPERIENCES_SUCCESS;
    constructor(public payload: core.ExperienceModel[]) { }
}

export class UpdateExperience implements Action {
    readonly type = UPDATE_EXPERIENCE;
    constructor(public payload: core.ExperienceModel) { }
}

export class UpdateExperienceFail implements Action {
    readonly type = UPDATE_EXPERIENCE_FAIL;
    constructor(public payload: any) { }
}

export class UpdateExperienceSuccess implements Action {
    readonly type = UPDATE_EXPERIENCE_SUCCESS;
    constructor(public payload: core.ExperienceModel) { }
}

export class SetHasChanges implements Action {
    readonly type = SET_HAS_CHANGES;
    constructor(public payload: boolean) { }
}

export class SetExperienceFavourite implements Action {
    readonly type = SET_EXPERIENCE_FAVOURITE;
    constructor(public payload: boolean, public id: string) { }
}

export class SetExperienceCompleted implements Action {
    readonly type = SET_EXPERIENCE_COMPLETED;
    constructor(public payload: boolean, public id: string) { }
}

export class SetExperienceLocation implements Action {
    readonly type = SET_EXPERIENCE_LOCATION;
    constructor(public payload: any) { }
}

export class SetExperienceOrder implements Action {
    readonly type = SET_EXPERIENCE_ORDER;
    constructor(public payload: any) { }
}

export class SetExperienceFilter implements Action {
    readonly type = SET_EXPERIENCE_FILTERS;
    constructor(public payload: any) { }
}

export class SetExperienceActivityCompleted implements Action {
    readonly type = SET_EXPERIENCE_ACTIVITY_COMPLETED;
    constructor(public experienceId: string, public activityId: string) { }
}

export type ExperiencesAction =
    | LoadExperiences
    | LoadExperiencesFail
    | LoadExperiencesSuccess
    | UpdateExperience
    | UpdateExperienceFail
    | UpdateExperienceSuccess
    | SetHasChanges
    | SetExperienceCompleted
    | SetExperienceLocation
    | SetExperienceActivityCompleted
    | SetExperienceFavourite
    | SetExperienceOrder
    | SetExperienceFilter;
