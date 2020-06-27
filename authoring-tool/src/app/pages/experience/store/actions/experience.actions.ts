import { Action } from '@ngrx/store';
import * as core from './../../../../core';

export const LOAD_EXPERIENCES = 'LOAD_EXPERIENCES';
export const LOAD_EXPERIENCES_FAIL = 'LOAD_EXPERIENCES_FAIL';
export const LOAD_EXPERIENCES_SUCCESS = 'LOAD_EXPERIENCES_SUCCESS';

export const CREATE_EXPERIENCE = 'CREATE_EXPERIENCE';
export const CREATE_EXPERIENCE_FAIL = 'CREATE_EXPERIENCE_FAIL';
export const CREATE_EXPERIENCE_SUCCESS = 'CREATE_EXPERIENCE_SUCCESS';

export const DELETE_EXPERIENCE = 'DELETE_EXPERIENCE';
export const DELETE_EXPERIENCE_FAIL = 'DELETE_EXPERIENCE_FAIL';
export const DELETE_EXPERIENCE_SUCCESS = 'DELETE_EXPERIENCE_SUCCESS';

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

export class CreateExperience implements Action {
    readonly type = CREATE_EXPERIENCE;
    constructor(public payload: core.ExperienceModel) { }
}

export class CreateExperienceFail implements Action {
    readonly type = CREATE_EXPERIENCE_FAIL;
    constructor(public payload: any) { }
}

export class CreateExperienceSuccess implements Action {
    readonly type = CREATE_EXPERIENCE_SUCCESS;
    constructor(public payload: core.ExperienceModel) { }
}

export class DeleteExperience implements Action {
    readonly type = DELETE_EXPERIENCE;
    constructor(public payload: string) { }
}

export class DeleteExperienceFail implements Action {
    readonly type = DELETE_EXPERIENCE_FAIL;
    constructor(public payload: any) { }
}

export class DeleteExperienceSuccess implements Action {
    readonly type = DELETE_EXPERIENCE_SUCCESS;
    constructor(public payload: string) { }
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

export type ExperiencesAction =
    | LoadExperiences
    | LoadExperiencesFail
    | LoadExperiencesSuccess
    | CreateExperience
    | CreateExperienceFail
    | CreateExperienceSuccess
    | DeleteExperience
    | DeleteExperienceFail
    | DeleteExperienceSuccess
    | UpdateExperience
    | UpdateExperienceFail
    | UpdateExperienceSuccess
    | SetHasChanges;
