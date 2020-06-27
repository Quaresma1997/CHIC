import { Action } from '@ngrx/store';
import * as core from './../../../../core';
import { HistoryActivityAction } from './activity.actions';
import { HistoryConnectionAction } from './connection.actions';

export const ACTION_HISTORY = 'ACTION_HISTORY';
export const CLEAR_HISTORY = 'CLEAR_HISTORY';

export class ActionHistory implements Action {
    readonly type = ACTION_HISTORY;
    constructor(public payload: HistoryActivityAction | HistoryConnectionAction) { }
}

export class ClearHistory implements Action {
    readonly type = CLEAR_HISTORY;
}

export type HistoryAction = ActionHistory | ClearHistory;
