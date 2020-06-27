import * as core from './../../../../core';
import * as actions from './../actions/experience.actions';

export interface ExperiencesState {
    entities: { [id: string]: core.ExperienceModel };
    loaded: boolean;
    loading: boolean;
    hasChanges: boolean;
}

export const initialState: ExperiencesState = {
    entities: {},
    loaded: false,
    loading: false,
    hasChanges: false
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
                    return {
                       ...accEntities,
                        [experience.id]: experience
                    };
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

        case actions.CREATE_EXPERIENCE_SUCCESS:
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

        case actions.UPDATE_EXPERIENCE_FAIL: {
            return { // return new object (immutable state)
                ...state,
            };
        }

        case actions.DELETE_EXPERIENCE_SUCCESS: {
            const experienceId = action.payload;

            const { [experienceId]: removed, ...entities } = state.entities;

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

        default:
            return state;
    }
}

export const getExperiencesLoading = (state: ExperiencesState) => state.loading;
export const getExperiencesLoaded = (state: ExperiencesState) => state.loaded;
export const getExperiencesEntities = (state: ExperiencesState) => state.entities;
export const getExperiencesHasChanges = (state: ExperiencesState) => state.hasChanges;
