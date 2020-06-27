import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import { Store } from '@ngrx/store';

import { tap, filter, take, switchMap, catchError } from 'rxjs/operators';

import * as navigation from './../../../../store';
import * as core from './../../../../core';
import * as dashboard from './../reducers';
import * as reducer from './../reducers/module.reducer';
import * as actions from './../actions';
import { Observable } from 'rxjs';

export const getModulesState = createSelector(dashboard.getDashboardState, (state: dashboard.DashboardState) => state.modules);

export const getModulesEntities = createSelector(getModulesState, reducer.getModulesEntities);

export const getModuleById = (moduleId: string) => createSelector(getAllModules,
    (entities): core.ModuleModel => {
        // if router.state exists && ...
        return entities.filter((module: core.ModuleModel) => module.id === moduleId).pop();
    }
);


/**
 * Convert back the `array-like` object to an array to bind to views
 */
export const getAllModules = createSelector(getModulesEntities, (entities) => {
    /*
    * Object.keys(entities) => [1,2,3]
    * [1,2,3].map(id => entities[id] )
    *
    */
    return Object.keys(entities)
        .map(id => entities[id]);

});

export const getModulesLoaded = createSelector(getModulesState, reducer.getModulesLoaded);
export const getModulesLoading = createSelector(getModulesState, reducer.getModulesLoading);

export const checkStoreModules = (store: any): Observable<boolean> => {

    return store.select(getModulesLoaded).pipe(
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
        take(1) // take only one value
        /*
          after loaded have become true, take only 1 value from stream and return
        */
    );
};
