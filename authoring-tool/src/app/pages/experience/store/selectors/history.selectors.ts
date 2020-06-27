import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import { Store } from '@ngrx/store';

import { tap, filter, take, switchMap, catchError } from 'rxjs/operators';

import * as navigation from './../../../../store';
import * as core from './../../../../core';
import * as dashboard from './../reducers';
import * as reducer from './../reducers/history.reducer';
import * as actions from './../actions';
import { Observable } from 'rxjs';

export const getHistoryState = createSelector(dashboard.getDashboardState, (state: dashboard.DashboardState) => state.history);

export const getActionsEntities = createSelector(getHistoryState, reducer.getActionsEntities);

/**
 * Convert back the `array-like` object to an array to bind to views
 */
export const getAllActions = createSelector(getActionsEntities, (entities) => {
    /*
    * Object.keys(entities) => [1,2,3]
    * [1,2,3].map(id => entities[id] )
    *
    */
    return Object.keys(entities)
        .map(id => entities[parseInt(id, 10)]);

});

export const getActionsCurIndex = createSelector(getHistoryState, reducer.getActionsCurIndex);
export const getActionsNext = createSelector(getHistoryState, reducer.getActionsNext);
export const getActionsPrevious = createSelector(getHistoryState, reducer.getActionsPrevious);

// export const getActionsLoaded = createSelector(getHistoryState, reducer.getActionsLoaded);
// export const getActionsLoading = createSelector(getHistoryState, reducer.getActionsLoading);

/* export const checkStore = (store: any): Observable<boolean> => {

    return store.select(getActionsLoaded).pipe(
        // a tap() is usually ignored out from the stream returned by pipe()
        // so as if it doesnt exist, therefore, fitler receives the original
        // input from the pipe()
        tap(loaded => {
            if (!loaded) {
                store.dispatch(new actions.LoadModules());
            }
        }),
        filter((loaded: boolean) => loaded), // wait here
        /*
          filter() emits only true values,
          So the output stream would wait until the (loaded) is true.
          Since an action was fired above, the modules would be loaded and hence the pipe() methods
          would run again and now filter() can return true and return a result
        */
/* take(1) // take only one value */
/*
  after loaded have become true, take only 1 value from stream and return
*/
/*);
};*/
