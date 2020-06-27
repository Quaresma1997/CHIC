import * as core from './../../../../core';
import * as actions from './../actions/activity.actions';

export interface ActivitiesState {
    entities: { [id: number]: core.ActivityModel };
    loaded: boolean;
    loading: boolean;
    newId: number;
}

export const initialState: ActivitiesState = {
    entities: {},
    loaded: false,
    loading: false,
    newId: 1
};


export function reducer(
    state: ActivitiesState = initialState,
    action: actions.ActivitiesAction
): ActivitiesState {
    switch (action.type) {
        /*case actions.LOAD_ACTIVITIES: {
            return {
                ...state,
                loading: true
            };
        }*/

        case actions.LOAD_ACTIVITIES_SUCCESS: {
            const activities = action.payload;

            const entities = activities.reduce(
                (accEntities: { [id: number]: core.ActivityModel }, activity) => {
                    return {
                        ...accEntities,
                        [activity.id]: activity
                    };
                }, []
            );

            return { // return new object (immutable state)
                ...state,
                loading: false,
                loaded: true,
                newId: core.createId(Object.keys(entities)),
                entities,
            };
        }

        case actions.LOAD_ACTIVITIES_FAIL: {
            return { // return new object (immutable state)
                ...state,
                loaded: false,
                loading: false,
            };
        }

        case actions.ADD_ACTIVITY_SUCCESS: {
            // console.log('ADD ACTIVITY');
            const activity = action.payload;
            const entities = {
                ...state.entities,
                [activity.id]: activity
            };

            return {
                ...state,
                entities,
                newId: state.newId + 1
            };
        }

        case actions.UPDATE_ACTIVITY_SUCCESS: {
            const activity = (action.undo ? action.payload.oldActivity : action.payload.activity);
            // const activity = action.payload;
            const entities = {
                ...state.entities,
                [activity.id]: activity
            };

            return {
                ...state,
                entities
            };
        }

        case actions.REMOVE_ACTIVITY_SUCCESS: {
            const activityId = action.payload.id;

            const { [activityId]: removed, ...entities } = state.entities;

            return {
                ...state,
                entities
            };
        }

        default:
            return state;
    }
}

export const getActivitiesLoading = (state: ActivitiesState) => state.loading;
export const getActivitiesLoaded = (state: ActivitiesState) => state.loaded;
export const getActivitiesEntities = (state: ActivitiesState) => state.entities;
export const getActivitiesNewId = (state: ActivitiesState) => state.newId;
