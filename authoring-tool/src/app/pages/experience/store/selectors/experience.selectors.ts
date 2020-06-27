import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import { select, Store } from '@ngrx/store';

import { tap, filter, take, switchMap, catchError } from 'rxjs/operators';

import * as navigation from './../../../../store';
import * as core from './../../../../core';
import * as dashboard from './../reducers';
import * as reducer from './../reducers/experience.reducer';
import * as actions from './../actions';
import { Observable } from 'rxjs';

export const getExperiencesState = createSelector(dashboard.getDashboardState, (state: dashboard.DashboardState) => state.experiences);

export const getExperienceEntities = createSelector(getExperiencesState, reducer.getExperiencesEntities);

export const getSelectedExperience = createSelector(getExperienceEntities, navigation.getRouterState,
    (entities, router): core.ExperienceModel => {
        // if router.state exists && ...

        return router.state && entities[router.state.params.id]; // using router state to look up an entity
    }
);

export const getExperiencesByTitle = (query: string) => createSelector(getAllExperiences,
    (entities): core.ExperienceModel[] => {
        // if router.state exists && ...

        return entities.filter((experience: core.ExperienceModel) => experience.title.toUpperCase().includes(query.toUpperCase()));
    }
);


/**
 * Convert back the `array-like` object to an array to bind to views
 */
export const getAllExperiences = createSelector(getExperienceEntities, (entities) => {
    /*
    * Object.keys(entities) => [1,2,3]
    * [1,2,3].map(id => entities[id] )
    *
    */
    return Object.keys(entities)
        .map(id => entities[id]);

});

export const getExperiencesLoaded = createSelector(getExperiencesState, reducer.getExperiencesLoaded);
export const getExperiencesLoading = createSelector(getExperiencesState, reducer.getExperiencesLoading);
export const getExperiencesHasChanges = createSelector(getExperiencesState, reducer.getExperiencesHasChanges);

export const checkStoreExperiences = (store: Store<dashboard.DashboardState>): Observable<boolean> => {
    return store.select(getExperiencesLoaded).pipe(
        // a tap() is usually ignored out from the stream returned by pipe()
        // so as if it doesnt exist, therefore, fitler receives the original
        // input from the pipe()

        tap(loaded => {

            if (!loaded) {
                store.dispatch(new actions.LoadExperiences());
            }
        }),
        filter((loaded: boolean) => loaded), // wait here
        /*
          filter() emits only true values,
          So the output stream would wait until the (loaded) is true.
          Since an action was fired above, the experiences would be loaded and hence the pipe() methods
          would run again and now filter() can return true and return a result
        */
        take(1) // take only one value
        /*
          after loaded have become true, take only 1 value from stream and return
        */
    );
};
