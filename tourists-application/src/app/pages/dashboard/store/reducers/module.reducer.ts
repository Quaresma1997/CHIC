import * as core from './../../../../core';
import * as actions from './../actions/module.actions';

export interface ModulesState {
    entities: { [id: string]: core.ModuleModel };
    loaded: boolean;
    loading: boolean;
}

export const initialState: ModulesState = {
    entities: {},
    loaded: false,
    loading: false,
};


export function reducer(
    state: ModulesState = initialState,
    action: actions.ModulesAction
): ModulesState {
    switch (action.type) {
        case actions.LOAD_MODULES: {
            return {
                ...state,
                loading: true
            };
        }

        case actions.LOAD_MODULES_SUCCESS: {
            const modules = action.payload;
            const entities = modules.reduce(
                (accEntities: { [id: string]: core.ModuleModel }, module) => {
                    return {
                        ...accEntities,
                        [module.id]: module
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

        case actions.LOAD_MODULES_FAIL: {
            return { // return new object (immutable state)
                ...state,
                loaded: false,
                loading: false,
            };
        }

        default:
            return state;
    }
}

export const getModulesLoading = (state: ModulesState) => state.loading;
export const getModulesLoaded = (state: ModulesState) => state.loaded;
export const getModulesEntities = (state: ModulesState) => state.entities;
