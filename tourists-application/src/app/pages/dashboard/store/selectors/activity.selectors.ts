import { createSelector } from '@ngrx/store';

import * as core from './../../../../core';
import * as dashboard from './../reducers';
import * as reducer from './../reducers/activity.reducer';
import * as navigation from './../../../../store';

export const getActivitiesState = createSelector(dashboard.getDashboardState, (state: dashboard.DashboardState) => state.activities);

export const getActivitiesEntities = createSelector(getActivitiesState, reducer.getActivitiesEntities);
export const getAvailableEntities = createSelector(getActivitiesState, reducer.getAvailableEntities);
export const getActivitiesSequence = createSelector(getActivitiesState, reducer.getActivitiesSequence);

export const getActivityById = (activityId: number) => createSelector(getAvailableEntities,
    (entities): core.ActivityModel => {
        // if router.state exists && ...
        return entities[activityId];
    }
);



export const getRouterId = createSelector(navigation.getRouterState,
    (router): number => {
        // if router.state exists && ...
        return router.state.params.id; // using router state to look up an entity
    }
);

export const getSelectedActivity = createSelector(getAvailableEntities, navigation.getRouterState,
    (entities, router): core.ActivityModel => {
        // if router.state exists && ...
        // console.log(entities);
        return router.state && entities[router.state.params.id]; // using router state to look up an entity
    }
);

export const getActivityGoals = (activityId: number) => createSelector(getAvailableEntities,
    (entities): boolean[] => {
        // if router.state exists && ...
        return entities[activityId].goals;
    }
);

export const getAvailableActivitiesCompleted = () => createSelector(getAllAvailableActivities,
    (entities): core.ActivityModel[] => {
        return entities.filter((activity: core.ActivityModel) => (activity.completed));
    }
);

export const getActivitiesNotInAvailable = (newActivities: core.ActivityModel[]) => createSelector(getAvailableEntities,
    (entities): core.ActivityModel[] => {
        // if router.state exists && ...
        return newActivities.filter((activity: core.ActivityModel) => (entities[activity.id] == null));
    }
);


export const getActivityGoalCompleted = (activityId: number, goalId: number) => createSelector(getAvailableEntities,
    (entities): boolean => {
        // if router.state exists && ...
        if (entities[activityId].goals.length === 0) {
            return false;
        }

        return entities[activityId].goals[goalId];
    }
);

export const getAllActivityGoalsCompleted = (activityId: number) => createSelector(getAvailableEntities,
    (entities): boolean => {
        // if router.state exists && ...
        let ret = true;
        if (entities[activityId].goals.length === 0) {
            return true;
        }

        entities[activityId].goals.forEach(g => {
            if (!g) {
                ret = false;
            }
        });
        return ret;
    }
);


export const getAllActivitiesCompleted = () => createSelector(getActivitiesEntities,
    (entities): boolean => {
        // if router.state exists && ...
        let ret = true;
        Object.keys(entities).forEach(key => {
            if (!entities[key].completed) {
                ret = false;
            }
        });
        return ret;
    }
);


export const getStartActivity = () => createSelector(getAllActivities, (entities): core.ActivityModel => {
    return entities.filter((activity: core.ActivityModel) => activity.startActivity === true).pop();
});

export const getFinalActivities = () => createSelector(getAllActivities, (entities): core.ActivityModel[] => {
    return entities.filter((activity: core.ActivityModel) => activity.finalActivity === true);
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

export const getAllAvailableActivities = createSelector(getAvailableEntities, (entities) => {
    /*
    * Object.keys(entities) => [1,2,3]
    * [1,2,3].map(id => entities[id] )
    *
    */
    return Object.keys(entities)
        .map(id => entities[parseInt(id, 10)]);

});

export const getActivitiesOrderedByDistance = createSelector(getAllAvailableActivities, (entities) => {
    return entities.sort((a, b) => a.distance - b.distance);
});

export const getActivitiesLoaded = createSelector(getActivitiesState, reducer.getActivitiesLoaded);
export const getActivitiesLoading = createSelector(getActivitiesState, reducer.getActivitiesLoading);

