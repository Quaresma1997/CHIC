import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import { select, Store } from '@ngrx/store';

import { tap, filter, take, switchMap, catchError } from 'rxjs/operators';

import * as navigation from './../../../../store';
import * as core from './../../../../core';
import { distance } from './../../../../core/auxFunctions';
import * as dashboard from './../reducers';
import * as reducer from './../reducers/experience.reducer';
import * as actions from './../actions';
import { Observable } from 'rxjs';

export const getExperiencesState = createSelector(dashboard.getDashboardState, (state: dashboard.DashboardState) => state.experiences);

export const getExperienceEntities = createSelector(getExperiencesState, reducer.getExperiencesEntities);

export const getSelectedExperienceId = createSelector(navigation.getRouterState,
    (router): string => {
        // if router.state exists && ...
        const id = router.state.url.split('/', 3)[2];
        // console.log(router.state.url.split('/', 5));
        return id; // using router state to look up an entity
    }
);

export const getExperienceById = (experienceId: string) => createSelector(getExperienceEntities,
    (entities): core.ExperienceModel => {
        // if router.state exists && ...
        return entities[experienceId];
    }
);



export const getSelectedExperience = createSelector(getExperienceEntities, navigation.getRouterState,
    (entities, router): core.ExperienceModel => {
        // if router.state exists && ...
        const id = router.state.url.split('/', 3)[2];
        // console.log(router.state.url.split('/', 5));
        return router.state && entities[id]; // using router state to look up an entity
    }
);

export const getExperiencesFavouritesByTitle = (query: string, location) => createSelector(getFavouritesOrdered(location),
    (entities): core.ExperienceModel[] => {
        // if router.state exists && ...

        return entities.filter((experience: core.ExperienceModel) => experience.favourite &&
            experience.title.toUpperCase().includes(query.toUpperCase()));
    }
);

export const getExperiencesByTitle = (query: string, location) => createSelector(getExperiencesOrdered(location),
    (entities): core.ExperienceModel[] => {
        // if router.state exists && ...

        return entities.filter((experience: core.ExperienceModel) => experience.title.toUpperCase().includes(query.toUpperCase()));
    }
);

export const getExperiencesFavouritesByTag = (query: string) => createSelector(getAllExperiences,
    (entities): core.ExperienceModel[] => {
        // if router.state exists && ...

        return entities.filter((experience: core.ExperienceModel) => experience.favourite &&
            experience.tags.toUpperCase().includes(query.toUpperCase()));
    }
);


export const getExperiencesTags = () => createSelector(getAllExperiences,
    (entities): string[] => {
        // if router.state exists && ...

        const tags = [];
        entities.forEach(experience => {
            if (!tags.includes(experience.tags)) {
                tags.push(experience.tags);
            }
        });
        return tags;
    }
);

export const getFavourites = createSelector(getExperienceEntities,
    (entities) => {
        const ret = [];
        Object.keys(entities).forEach(id => {
            if (entities[id].favourite) {
                ret.push(entities[id]);
            }
        });
        return ret;
    }
);

export const getFavouritesOrdered = (location) =>
    createSelector(getFavourites, getExperienceOrder, getExperienceFilter, (entities, order, filters) => {
        Object.keys(filters).forEach(key => {
            switch (key) {
                case 'proximity':
                    if (location === null) {
                        break;
                    }

                    entities = entities.filter((experience: core.ExperienceModel) => {
                        const dist = distance(location[0], location[1], experience.location.lat, experience.location.lng);
                        return (dist < parseInt(filters[key], 10) ? true : false);
                    });
                    break;
                case 'tag':
                    entities = entities.filter((experience: core.ExperienceModel) =>
                        experience.tags.toUpperCase().includes(filters[key].toUpperCase()));
                    break;
                default:
                    break;
            }
        });

        switch (order) {
            case 'date':
                return entities.sort((a, b) => {
                    if (a.date < b.date) { return 1; }
                    if (a.date > b.date) { return -1; }
                    return 0;
                });
            case 'distance':
                if (location === null) {
                    return entities;
                }
                return entities.sort((a, b) => distance(location[0], location[1], a.location.lat, a.location.lng) -
                    distance(location[0], location[1], b.location.lat, b.location.lng));
            case 'name':
                return entities.sort((a, b) => {
                    if (a.title.toLowerCase() < b.title.toLowerCase()) { return -1; }
                    if (a.title.toLowerCase() > b.title.toLowerCase()) { return 1; }
                    return 0;
                });
            default:
                break;
        }

    });


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

export const getExperiencesOrdered = (location) =>
    createSelector(getAllExperiences, getExperienceOrder, getExperienceFilter, (entities, order, filters) => {
        Object.keys(filters).forEach(key => {
            switch (key) {
                case 'proximity':
                    if (location === null) {
                        break;
                    }

                    entities = entities.filter((experience: core.ExperienceModel) => {
                        const dist = distance(location[0], location[1], experience.location.lat, experience.location.lng);
                        return (dist < parseInt(filters[key], 10) ? true : false);
                    });
                    break;
                case 'tag':
                    entities = entities.filter((experience: core.ExperienceModel) =>
                        experience.tags.toUpperCase().includes(filters[key].toUpperCase()));
                    break;
                default:
                    break;
            }
        });

        switch (order) {
            case 'date':
                return entities.sort((a, b) => {
                    if (a.date < b.date) { return 1; }
                    if (a.date > b.date) { return -1; }
                    return 0;
                });
            case 'distance':
                if (location === null) {
                    return entities;
                }
                return entities.sort((a, b) => distance(location[0], location[1], a.location.lat, a.location.lng) -
                    distance(location[0], location[1], b.location.lat, b.location.lng));
            case 'name':
                return entities.sort((a, b) => {
                    if (a.title.toLowerCase() < b.title.toLowerCase()) { return -1; }
                    if (a.title.toLowerCase() > b.title.toLowerCase()) { return 1; }
                    return 0;
                });
            default:
                break;
        }

    });

export const getExperiencesLoaded = createSelector(getExperiencesState, reducer.getExperiencesLoaded);
export const getExperiencesLoading = createSelector(getExperiencesState, reducer.getExperiencesLoading);
export const getExperiencesHasChanges = createSelector(getExperiencesState, reducer.getExperiencesHasChanges);
export const getExperienceLocation = createSelector(getExperiencesState, reducer.getExperienceLocation);
export const getExperienceOrder = createSelector(getExperiencesState, reducer.getExperienceOrder);
export const getExperienceFilter = createSelector(getExperiencesState, reducer.getExperienceFilter);

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
