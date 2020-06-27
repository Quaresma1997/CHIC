import { ActionReducerMap, createFeatureSelector, createSelector, props } from '@ngrx/store';

import { Store } from '@ngrx/store';

import { tap, filter, take, switchMap, catchError } from 'rxjs/operators';

import * as navigation from './../../../../store';
import * as core from './../../../../core';
import * as dashboard from './../reducers';
import * as reducer from './../reducers/connection.reducer';
import * as activitiesSelector from './activity.selectors';
import * as actions from './../actions';
import { Observable } from 'rxjs';

export const getConnectionsState = createSelector(dashboard.getDashboardState, (state: dashboard.DashboardState) => state.connections);

export const getConnectionsEntities = createSelector(getConnectionsState, reducer.getConnectionsEntities);

/*export const getConnectionsFromExperience = (experienceId: number) => createSelector(getAllConnections,
    (entities): core.ConnectionModel[] => {
        // if router.state exists && ...
        return entities.filter((connection: core.ConnectionModel) => connection.experienceId === experienceId);
    }
);*/

export const getConnectionById = (connectionId: number) => createSelector(getConnectionsEntities,
    (entities): core.ConnectionModel => {
        // if router.state exists && ...
        return entities[connectionId];
    }
);

export const getConnectionsFromActivity = (activityId: number) => createSelector(getAllConnections,
    activitiesSelector.getActivitiesEntities,
    (entities, activities): core.ConnectionModel[] => {
        // if router.state exists && ...
        return entities.filter((connection: core.ConnectionModel) => ((connection.targetId === activityId ||
            connection.sourceId === activityId)) && activities[connection.targetId] != null &&
            activities[connection.sourceId] != null);
    }
);

export const getConnectionsFromActivityAsTarget = (activityId: number) => createSelector(getAllConnections,
    activitiesSelector.getActivitiesEntities,
    (entities, activities): core.ConnectionModel[] => {
        // if router.state exists && ...
        return entities.filter((connection: core.ConnectionModel) => (connection.targetId === activityId &&
            activities[connection.targetId] != null && activities[connection.sourceId] != null
        ));
    }
);

export const getConnectionsFromActivityAsSource = (activityId: number) => createSelector(getAllConnections,
    activitiesSelector.getActivitiesEntities,
    (entities, activities): core.ConnectionModel[] => {
        // if router.state exists && ...
        // console.log(activities);
        return entities.filter((connection: core.ConnectionModel) => (connection.sourceId === activityId &&
            activities[connection.sourceId] != null && activities[connection.targetId] != null
        ));
    }
);

export const getActivitiesFromActivityAsSource = (activityId: number) => createSelector(getConnectionsFromActivityAsSource(activityId),
    activitiesSelector.getActivitiesEntities,
    (entities, activities): core.ActivityModel[] => {
        // if router.state exists && ...
        const retActivities: core.ActivityModel[] = [];
        entities.forEach(conn => {
            retActivities.push(activities[conn.targetId]);
        });
        return retActivities;
    }
);

export const getConnectionsNewId = () => createSelector(getConnectionsEntities, (entities) => {
    return core.createId(Object.keys(entities));
});

export const getConnectionsFromExperienceActive = () => createSelector(getAllConnections, activitiesSelector.getActivitiesEntities,
    (entities, activities): core.ConnectionModel[] => {
        // if router.state exists && ...
        return entities.filter((connection: core.ConnectionModel) => (activities[connection.targetId] != null &&
            activities[connection.sourceId] != null));
    }
);

/**
 * Convert back the `array-like` object to an array to bind to views
 */
export const getAllConnections = createSelector(getConnectionsEntities, (entities) => {
    /*
    * Object.keys(entities) => [1,2,3]
    * [1,2,3].map(id => entities[id] )
    *
    */
    return Object.keys(entities)
        .map(id => entities[parseInt(id, 10)]);

});

export const getConnectionsLoaded = createSelector(getConnectionsState, reducer.getConnectionsLoaded);
export const getConnectionsLoading = createSelector(getConnectionsState, reducer.getConnectionsLoading);

/*export const checkStoreConnections = (store: any): Observable<boolean> => {

    return store.select(getConnectionsLoaded).pipe(
        // a tap() is usually ignored out from the stream returned by pipe()
        // so as if it doesnt exist, therefore, fitler receives the original
        // input from the pipe()
        tap(loaded => {
            if (!loaded) {
                store.dispatch(new actions.LoadConnections());
            }
        }),
        filter((loaded: boolean) => loaded), // wait here*/
/*
  filter() emits only true values,
  So the output stream would wait until the (loaded) is true.
  Since an action was fired above, the Connections would be loaded and hence the pipe() methods
  would run again and now filter() can return true and return a result
*/
        // take(1) // take only one value
/*
  after loaded have become true, take only 1 value from stream and return
*/
/*);
};*/
