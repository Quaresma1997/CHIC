import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import * as experience from './experience.reducer';
import * as module from './module.reducer';
import * as activity from './activity.reducer';
import * as connection from './connection.reducer';

/**
 * Dashboard state
 */
export interface DashboardState {
    experiences: experience.ExperiencesState;
    modules: module.ModulesState;
    activities: activity.ActivitiesState;
    connections: connection.ConnectionsState;
}

/**
 * Register the reducers for the HeroesFeatureState
 */
export const reducers: ActionReducerMap<DashboardState> = {
    experiences: experience.reducer,
    modules: module.reducer,
    activities: activity.reducer,
    connections: connection.reducer,
};

export const getDashboardState = createFeatureSelector<DashboardState>('dashboard');
