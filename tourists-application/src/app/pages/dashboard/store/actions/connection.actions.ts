import { Action } from '@ngrx/store';
import * as core from './../../../../core';

export const LOAD_CONNECTIONS_FAIL = 'LOAD_CONNECTIONS_FAIL';
export const LOAD_CONNECTIONS_SUCCESS = 'LOAD_CONNECTIONS_SUCCESS';


export class LoadConnectionsFail implements Action {
    readonly type = LOAD_CONNECTIONS_FAIL;
    constructor(public payload: any) { }
}

export class LoadConnectionsSuccess implements Action {
    readonly type = LOAD_CONNECTIONS_SUCCESS;
    constructor(public payload: core.ConnectionModel[]) { }
}

export type ConnectionsAction =
    | LoadConnectionsFail
    | LoadConnectionsSuccess;
