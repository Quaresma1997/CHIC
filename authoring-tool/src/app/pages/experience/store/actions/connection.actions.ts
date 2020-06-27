import { Action } from '@ngrx/store';
import * as core from './../../../../core';


// export const LOAD_CONNECTIONS = 'LOAD_CONNECTIONS';
export const LOAD_CONNECTIONS_FAIL = 'LOAD_CONNECTIONS_FAIL';
export const LOAD_CONNECTIONS_SUCCESS = 'LOAD_CONNECTIONS_SUCCESS';

export const ADD_CONNECTION = 'ADD_CONNECTION';
export const ADD_CONNECTION_FAIL = 'ADD_CONNECTION_FAIL';
export const ADD_CONNECTION_SUCCESS = 'ADD_CONNECTION_SUCCESS';

export const UPDATE_CONNECTION = 'UPDATE_CONNECTION';
export const UPDATE_CONNECTION_FAIL = 'UPDATE_CONNECTION_FAIL';
export const UPDATE_CONNECTION_SUCCESS = 'UPDATE_CONNECTION_SUCCESS';

export const REMOVE_CONNECTION = 'REMOVE_CONNECTION';
export const REMOVE_CONNECTION_FAIL = 'REMOVE_CONNECTION_FAIL';
export const REMOVE_CONNECTION_SUCCESS = 'REMOVE_CONNECTION_SUCCESS';

/* export class LoadConnections implements Action {
    readonly type = LOAD_CONNECTIONS;
} */

export class LoadConnectionsFail implements Action {
    readonly type = LOAD_CONNECTIONS_FAIL;
    constructor(public payload: any) { }
}

export class LoadConnectionsSuccess implements Action {
    readonly type = LOAD_CONNECTIONS_SUCCESS;
    constructor(public payload: core.ConnectionModel[]) { }
}

export class AddConnection implements Action {
    readonly type = ADD_CONNECTION;
    constructor(public payload: core.ConnectionModel, public redo?: boolean, public undo?: boolean) { }
}

export class AddConnectionFail implements Action {
    readonly type = ADD_CONNECTION_FAIL;
    constructor(public payload: any) { }
}

export class AddConnectionSuccess implements Action {
    readonly type = ADD_CONNECTION_SUCCESS;
    constructor(public payload: core.ConnectionModel) { }
}

export class UpdateConnection implements Action {
    readonly type = UPDATE_CONNECTION;
    constructor(public payload: core.ConnectionModel, public redo?: boolean, public undo?: boolean) { }
}

export class UpdateConnectionFail implements Action {
    readonly type = UPDATE_CONNECTION_FAIL;
}

export class UpdateConnectionSuccess implements Action {
    readonly type = UPDATE_CONNECTION_SUCCESS;
    constructor(public payload: core.ConnectionModel) { }
}

export class RemoveConnection implements Action {
    readonly type = REMOVE_CONNECTION;
    constructor(public payload: core.ConnectionModel, public redo?: boolean, public undo?: boolean) { }
}

export class RemoveConnectionFail implements Action {
    readonly type = REMOVE_CONNECTION_FAIL;
    constructor(public payload: any) { }
}

export class RemoveConnectionSuccess implements Action {
    readonly type = REMOVE_CONNECTION_SUCCESS;
    constructor(public payload: core.ConnectionModel) { }
}
export type ConnectionsAction =
    // | LoadConnections
    | LoadConnectionsFail
    | LoadConnectionsSuccess
    | AddConnection
    | AddConnectionFail
    | AddConnectionSuccess
    | UpdateConnection
    | UpdateConnectionFail
    | UpdateConnectionSuccess
    | RemoveConnection
    | RemoveConnectionFail
    | RemoveConnectionSuccess;

export type HistoryConnectionAction =
    | AddConnection
    | RemoveConnection;

