import * as fromRouter from '@ngrx/router-store';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Params } from '@angular/router';
import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

export interface RouterStateUrl { // SerializedRouterStateSnapshot
    url: string;
    queryParams: Params;
    params: Params;
}

export interface AppState {
    router: fromRouter.RouterReducerState<RouterStateUrl>;
}

export const reducers: ActionReducerMap<AppState> = {
    router: fromRouter.routerReducer // routerReducer returns RouterReducerState<T>
};

export const getRouterState = createFeatureSelector<fromRouter.RouterReducerState<RouterStateUrl>>('router');

export class CustomSerializer implements fromRouter.RouterStateSerializer<RouterStateUrl> {
    serialize(routerState: RouterStateSnapshot): RouterStateUrl {
        const { url } = routerState;
        const { queryParams } = routerState.root;

        let state: ActivatedRouteSnapshot = routerState.root;
        while (state.firstChild) {
            state = state.firstChild;
        }
        const { params } = state;

        return { url, queryParams, params };
    }
}
