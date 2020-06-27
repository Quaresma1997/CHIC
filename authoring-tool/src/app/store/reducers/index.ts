import * as fromRouter from '@ngrx/router-store';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Params } from '@angular/router';
import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

/**
 * The RouterStateSerializer takes the current RouterStateSnapshot
 * and returns any pertinent information needed. The snapshot contains
 * all information about the state of the router at the given point in time.
 * The entire snapshot is complex and not always needed. In this case, you only
 * need the URL and query parameters from the snapshot in the store. Other items could be
 * returned such as route parameters and static route data.
 */
export interface RouterStateUrl { // SerializedRouterStateSnapshot
    url: string;
    queryParams: Params;
    params: Params;
}

/**
 * App State
 * As mentioned, we treat each reducer like a table in a database. This means
 * our top level state interface is just a map of keys to inner state types.
 */
export interface AppState {
    /*
        export type RouterReducerState<T = SerializedRouterStateSnapshot> = {
            state: T;
            navigationId: number;
        };
    */
    router: fromRouter.RouterReducerState<RouterStateUrl>;
}

/**
 * App Reducers
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const reducers: ActionReducerMap<AppState> = {
    router: fromRouter.routerReducer // routerReducer returns RouterReducerState<T>
};

/**
 * Selectors
 */
export const getRouterState = createFeatureSelector<fromRouter.RouterReducerState<RouterStateUrl>>('router');

/**
 * Serializer is needed to grab whatever needed from the Angular RouterState into the
 * RouterStateUrl to be stored by the ngrx/store.
 */
export class CustomSerializer implements fromRouter.RouterStateSerializer<RouterStateUrl> {
    serialize(routerState: RouterStateSnapshot): RouterStateUrl {
        const { url } = routerState;
        const { queryParams } = routerState.root; // extract

        let state: ActivatedRouteSnapshot = routerState.root; // state tree
        while (state.firstChild) {
            state = state.firstChild;
        }
        const { params } = state;

        return { url, queryParams, params };
    }
}


/* https://www.codemag.com/Article/1811061/Angular-and-the-Store */
