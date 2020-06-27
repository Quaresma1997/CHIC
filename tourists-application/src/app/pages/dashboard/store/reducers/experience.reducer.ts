import * as core from './../../../../core';
import * as actions from './../actions/experience.actions';

export interface ExperiencesState {
    entities: { [id: string]: core.ExperienceModel };
    loaded: boolean;
    loading: boolean;
    hasChanges: boolean;
    location: any;
    filter: { [label: string]: string };
    order: string;

}

export const initialState: ExperiencesState = {
    entities: {},
    loaded: false,
    loading: false,
    hasChanges: false,
    location: null,
    filter: {},
    order: 'distance'
};


export function reducer(
    state: ExperiencesState = initialState,
    action: actions.ExperiencesAction
): ExperiencesState {
    switch (action.type) {
        case actions.LOAD_EXPERIENCES: {
            return {
                ...state,
                loading: true
            };
        }

        case actions.LOAD_EXPERIENCES_SUCCESS: {
            const experiences = action.payload;

            const entities = experiences.reduce(
                (accEntities: { [id: string]: core.ExperienceModel }, experience) => {
                    if (experience.published && experience.activities.length > 0) {
                        return {
                            ...accEntities,
                            [experience.id]: experience
                        };
                    } else {
                        return {
                            ...accEntities,
                        };
                    }

                }, {
                ...state.entities // initial value
            }
            );

            return { // return new object (immutable state)
                ...state,
                loading: false,
                loaded: true,
                entities,
            };
        }

        case actions.LOAD_EXPERIENCES_FAIL: {
            return { // return new object (immutable state)
                ...state,
                loaded: false,
                loading: false,
            };
        }

        case actions.UPDATE_EXPERIENCE_SUCCESS: {
            const experience = action.payload;

            const entities = {
                ...state.entities,
                [experience.id]: experience
            };

            return {
                ...state,
                entities
            };
        }


        case actions.SET_HAS_CHANGES: {
            const hasChanges = action.payload;

            return {
                ...state,
                hasChanges
            };
        }

        case actions.SET_EXPERIENCE_LOCATION: {
            const location = action.payload;
            return {
                ...state,
                location
            };
        }

        case actions.SET_EXPERIENCE_COMPLETED: {
            const experience = state.entities[action.id];
            experience.completed = action.payload;

            const entities = {
                ...state.entities,
                [experience.id]: experience
            };

            return {
                ...state,
                entities
            };
        }

        case actions.SET_EXPERIENCE_FAVOURITE: {
            const experience = state.entities[action.id];
            experience.favourite = action.payload;

            const entities = {
                ...state.entities,
                [experience.id]: experience
            };

            return {
                ...state,
                entities
            };
        }

        case actions.SET_EXPERIENCE_ACTIVITY_COMPLETED: {
            const experience = state.entities[action.experienceId];
            experience.activities[action.activityId].completed = true;

            const entities = {
                ...state.entities,
                [experience.id]: experience
            };

            return {
                ...state,
                entities
            };
        }

        case actions.SET_EXPERIENCE_ORDER: {
            const order = action.payload;

            return {
                ...state,
                order
            };
        }

        case actions.SET_EXPERIENCE_FILTERS: {
            const filter = state.filter;
            const label = Object.keys(action.payload)[0];
            const value = Object.values(action.payload)[0];
            filter[label] = '' + value;
            if (label === 'proximity' && value === 0) {
                delete filter[label];
            }
            return {
                ...state,
                filter
            };
        }

        default:
            return state;
    }
}

export const getExperiencesLoading = (state: ExperiencesState) => state.loading;
export const getExperiencesLoaded = (state: ExperiencesState) => state.loaded;
export const getExperiencesEntities = (state: ExperiencesState) => state.entities;
export const getExperiencesHasChanges = (state: ExperiencesState) => state.hasChanges;
export const getExperienceLocation = (state: ExperiencesState) => state.location;
export const getExperienceOrder = (state: ExperiencesState) => state.order;
export const getExperienceFilter = (state: ExperiencesState) => state.filter;
