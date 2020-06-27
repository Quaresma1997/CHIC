import { ActionReducerMap, createFeatureSelector, createSelector, props } from '@ngrx/store';

import { Store } from '@ngrx/store';

import { tap, filter, take, switchMap, catchError } from 'rxjs/operators';

import * as navigation from './../../../../store';
import * as core from './../../../../core';
import * as dashboard from './../reducers';
import * as reducer from './../reducers/activity.reducer';
import * as connectionsSelector from './connection.selectors';
import * as actions from './../actions';
import { Observable } from 'rxjs';

export const getActivitiesState = createSelector(dashboard.getDashboardState, (state: dashboard.DashboardState) => state.activities);

export const getActivitiesEntities = createSelector(getActivitiesState, reducer.getActivitiesEntities);

/*export const getActivitiesFromExperience = (experienceId: number) => createSelector(getAllActivities,
    (entities): core.ActivityModel[] => {
        // if router.state exists && ...
        return entities.filter((activity: core.ActivityModel) => activity.experienceId === experienceId);
    }
);*/

export const getActivityById = (activityId: number) => createSelector(getActivitiesEntities,
    (entities): core.ActivityModel => {
        // if router.state exists && ...
        return entities[activityId];
    }
);


export const getStartActivity = () => createSelector(getAllActivities, (entities): core.ActivityModel => {
    return entities.filter((activity: core.ActivityModel) => activity.startActivity === true).pop();
});




/**
 * Convert back the `array-like` object to an array to bind to views
 */
export const getAllActivities = createSelector(getActivitiesEntities, (entities) => {
    /*
    * Object.keys(entities) => [1,2,3]
    * [1,2,3].map(id => entities[id] )
    *
    */
    return Object.keys(entities)
        .map(id => entities[parseInt(id, 10)]);

});

export const getActivitiesLoaded = createSelector(getActivitiesState, reducer.getActivitiesLoaded);
export const getActivitiesLoading = createSelector(getActivitiesState, reducer.getActivitiesLoading);
export const getActivitiesNewId = () => createSelector(getActivitiesState, reducer.getActivitiesNewId);


/*export const checkStoreActivities = (store: any): Observable<boolean> => {

    return store.select(getActivitiesLoaded).pipe(
        // a tap() is usually ignored out from the stream returned by pipe()
        // so as if it doesnt exist, therefore, fitler receives the original
        // input from the pipe()
        tap(loaded => {
            if (!loaded) {
                store.dispatch(new actions.LoadActivities());
            }
        }),
        filter((loaded: boolean) => loaded), // wait here*/
        /*
          filter() emits only true values,
          So the output stream would wait until the (loaded) is true.
          Since an action was fired above, the Activities would be loaded and hence the pipe() methods
          would run again and now filter() can return true and return a result
        */
       // take(1) // take only one value
        /*
          after loaded have become true, take only 1 value from stream and return
        */
    /*);
};
*/
