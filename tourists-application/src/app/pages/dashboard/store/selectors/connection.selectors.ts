import { createSelector } from '@ngrx/store';

import * as core from './../../../../core';
import * as dashboard from './../reducers';
import * as reducer from './../reducers/connection.reducer';
import * as activitiesSelector from './activity.selectors';

export const getConnectionsState = createSelector(dashboard.getDashboardState, (state: dashboard.DashboardState) => state.connections);

export const getConnectionsEntities = createSelector(getConnectionsState, reducer.getConnectionsEntities);

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

export const getActivitiesFromActivityAsSourceNotCompleted = (activityId: number) =>
    createSelector(getConnectionsFromActivityAsSource(activityId),
        activitiesSelector.getActivitiesEntities,
        (entities, activities): core.ActivityModel[] => {
            // if router.state exists && ...
            const retActivities: core.ActivityModel[] = [];
            entities.forEach(conn => {
                if (!activities[conn.targetId].completed) {
                    retActivities.push(activities[conn.targetId]);
                }

            });
            return retActivities;
        }
    );

export const getActivitiesFromActivityAsTarget = (activityId: number) => createSelector(getConnectionsFromActivityAsTarget(activityId),
    activitiesSelector.getActivitiesEntities,
    (entities, activities): core.ActivityModel[] => {
        // if router.state exists && ...
        const retActivities: core.ActivityModel[] = [];
        entities.forEach(conn => {
            if (activities[conn.sourceId].completed) {
                retActivities.push(activities[conn.sourceId]);
            }
        });
        return retActivities;
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
