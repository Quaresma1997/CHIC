import * as core from './../../../../core';
import * as actions from './../actions/history.actions';
import { HistoryActivityAction } from '../actions/activity.actions';
import { HistoryConnectionAction } from '../actions/connection.actions';

export interface HistoryState {
    entities: HistoryActivityAction | HistoryConnectionAction[];
    // history: core.HistoryModel;
    /*loaded: boolean;
    loading: boolean;*/
    curIndex: number;
    nextAction: HistoryActivityAction | HistoryConnectionAction;
    previousAction: HistoryActivityAction | HistoryConnectionAction;
}

export const initialState: HistoryState = {
    entities: [],
    // history: new core.HistoryModel(),
    /*loaded: false,
    loading: false,*/
    curIndex: 0,
    nextAction: null,
    previousAction: null,

};


export function reducer(
    state: HistoryState = initialState,
    action: actions.HistoryAction
): HistoryState {
    switch (action.type) {
        case actions.CLEAR_HISTORY: {
            const entities = [];
            const curIndex = 0;
            const nextAction = null;
            const previousAction = null;

            return {
                ...state,
                curIndex,
                nextAction,
                previousAction,
                entities
            };
        }

        case actions.ACTION_HISTORY: {
            if (action.payload.redo && action.payload.undo) {

                return {
                    ...state
                };
            } else if (action.payload.redo) {
                if (state.nextAction != null) {
                    const idx = state.curIndex;

                    const copyEntities = Object.assign([], state.entities);

                    let previousAction: HistoryActivityAction | HistoryConnectionAction;
                    let nextAction: HistoryActivityAction | HistoryConnectionAction;

                    if (idx === copyEntities.length - 1) {
                        nextAction = null;
                        previousAction = { ...state.entities[idx] };
                    } else {
                        nextAction = { ...state.entities[idx + 1] };
                        previousAction = { ...state.entities[idx] };
                    }

                    const curIndex = idx + 1;

                    return {
                        ...state,
                        curIndex,
                        nextAction,
                        previousAction,
                    };
                }

                return { ...state };

            } else if (action.payload.undo) {
                if (state.previousAction != null) {
                    const idx = state.curIndex;
                    const curIndex = idx - 1;

                    let previousAction: HistoryActivityAction | HistoryConnectionAction;
                    let nextAction: HistoryActivityAction | HistoryConnectionAction;



                    if (curIndex === 0) {
                        nextAction = { ...state.entities[curIndex] };
                        previousAction = null;
                    } else {
                        nextAction = { ...state.entities[curIndex] };
                        previousAction = { ...state.entities[curIndex - 1] };
                    }

                    // console.log(nextAction, previousAction);


                    return {
                        ...state,
                        curIndex,
                        previousAction,
                        nextAction,
                    };
                }

                return { ...state };
            } else {
                // New action, not redo nor undo, so we add it to the history
                const copyEntities = Object.assign([], state.entities);
                const idx = state.curIndex;
                if (idx !== copyEntities.length) {
                    const dif = copyEntities.length - idx;
                    copyEntities.splice(idx, dif);
                }

                const entities = {
                    ...copyEntities,
                    [idx]: action.payload
                };


                const prevAction = { ...entities[idx] };

                const curIndex = idx + 1;


                return {
                    ...state,
                    curIndex,
                    nextAction: null,
                    previousAction: prevAction,
                    entities
                };
            }

        }

        default:
            return state;
    }
}

/*export const getActionsLoading = (state: HistoryState) => state.loading;
export const getActionsLoaded = (state: HistoryState) => state.loaded;*/
export const getActionsEntities = (state: HistoryState) => state.entities;
export const getActionsCurIndex = (state: HistoryState) => state.curIndex;
export const getActionsNext = (state: HistoryState) => state.nextAction;
export const getActionsPrevious = (state: HistoryState) => state.previousAction;
