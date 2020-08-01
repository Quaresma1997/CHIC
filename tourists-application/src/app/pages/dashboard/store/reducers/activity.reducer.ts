import * as core from './../../../../core';
import * as actions from './../actions/activity.actions';

export interface ActivitiesState {
    entities: { [id: number]: core.ActivityModel };
    availableEntities: { [id: number]: core.ActivityModel };
    activitiesSequence: core.ActivityModel[];
    loaded: boolean;
    loading: boolean;
}

export const initialState: ActivitiesState = {
    entities: {},
    availableEntities: {},
    activitiesSequence: [],
    loaded: false,
    loading: false,
};


export function reducer(
    state: ActivitiesState = initialState,
    action: actions.ActivitiesAction
): ActivitiesState {
    switch (action.type) {
        case actions.LOAD_ACTIVITIES_SUCCESS: {
            const activities = action.payload;
            const entities = activities.reduce(
                (accEntities: { [id: number]: core.ActivityModel }, activity) => {
                    // console.log(activity.moduleData);
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

        case actions.SET_ACTIVITIES_AVAILABLE: {
            const activities = action.payload;
            // console.log(activities);
            // console.log(state.availableEntities);
            const newEntts = activities.reduce(
                (accEntities: { [id: number]: core.ActivityModel }, activity) => {
                    return {
                        ...accEntities,
                        [activity.id]: activity
                    };
                }, []
            );

            const availableEntities = {
                ...state.availableEntities,
                ...newEntts
            };


            // console.log(availableEntities);

            return { // return new object (immutable state)
                ...state,
                availableEntities,
            };
        }

        case actions.REMOVE_ACTIVITIES_AVAILABLE: {
            const availableEntities = Object.assign({}, state.availableEntities);
            const ids = action.payload;
            ids.forEach(id => {
                delete availableEntities[id];
            });


            return { // return new object (immutable state)
                ...state,
                availableEntities,
            };
        }

        case actions.CLEAR_ACTIVITIES_AVAILABLE: {
            const availableEntities = {};

            return { // return new object (immutable state)
                ...state,
                availableEntities,
            };
        }

        case actions.SET_ACTIVITIES_SEQUENCE: {
            const activities = action.payload;
            // console.log(activities);
            // console.log(state.availableEntities);

            const activitiesSequence = Object.assign([], state.activitiesSequence);
            activitiesSequence.push(activities);

            // console.log(availableEntities);

            return { // return new object (immutable state)
                ...state,
                activitiesSequence,
            };
        }

        case actions.CLEAR_ACTIVITIES_SEQUENCE: {
            const activitiesSequence = [];

            return { // return new object (immutable state)
                ...state,
                activitiesSequence,
            };
        }

        case actions.SET_ACTIVITY_COMPLETED: {
            const activity = state.availableEntities[action.id];
            if (activity == null) {
                return {
                    ...state,
                };
            }
            activity.completed = action.payload;

            const availableEntities = {
                ...state.availableEntities,
                [activity.id]: activity
            };

            return {
                ...state,
                availableEntities
            };
        }

        case actions.SET_ACTIVITY_GOALS: {
            const activity = state.availableEntities[action.id];
            if (activity == null) {
                return {
                    ...state,
                };
            }
            activity.goals = action.payload;
            const availableEntities = {
                ...state.availableEntities,
                [activity.id]: activity
            };

            return {
                ...state,
                availableEntities
            };
        }

        case actions.SET_INITIAL_ACTIVITY_COMPLETED: {
            const activity = state.entities[action.id];
            activity.completed = action.payload;

            const entities = {
                ...state.entities,
                [activity.id]: activity
            };

            return {
                ...state,
                entities
            };
        }

        case actions.SET_INITIAL_ACTIVITY_GOALS: {
            const activity = state.entities[action.id];
            activity.goals = action.payload;
            const entities = {
                ...state.entities,
                [activity.id]: activity
            };

            return {
                ...state,
                entities
            };
        }

        case actions.MARK_ACTIVITY_GOAL_COMPLETED: {
            const activity = state.availableEntities[action.id];
            if (activity == null) {
                return {
                    ...state,
                };
            }
            activity.goals[action.goal] = true;
            // console.log(activity.goals);
            const availableEntities = {
                ...state.availableEntities,
                [activity.id]: activity
            };

            return {
                ...state,
                availableEntities
            };
        }

        case actions.UPDATE_ACTIVITY: {
            const activity = state.availableEntities[action.id];
            if (activity == null) {
                return {
                    ...state,
                };
            }
            activity.blocked = action.blocked;
            activity.distance = action.distance;

            const availableEntities = {
                ...state.availableEntities,
                [activity.id]: activity
            };

            return {
                ...state,
                availableEntities
            };
        }

        default:
            return state;
    }
}


export const getActivitiesLoading = (state: ActivitiesState) => state.loading;
export const getActivitiesLoaded = (state: ActivitiesState) => state.loaded;
export const getActivitiesEntities = (state: ActivitiesState) => state.entities;
export const getAvailableEntities = (state: ActivitiesState) => state.availableEntities;
export const getActivitiesSequence = (state: ActivitiesState) => state.activitiesSequence;
