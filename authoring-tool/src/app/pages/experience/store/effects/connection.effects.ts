import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { switchMap, map, catchError, debounceTime, distinctUntilChanged, concatMap, mergeMap } from 'rxjs/operators';
import { of, empty, Observable } from 'rxjs';

import * as navigation from './../../../../store';
import * as core from './../../../../core';
import * as actions from './../actions/connection.actions';
import * as actionsHistory from './../actions/history.actions';
import * as actionsExperience from './../actions/experience.actions';
import { ConnectionModel } from './../../../../core';


@Injectable()
export class ConnectionEffects {
    constructor(
        private actions$: Actions
        // private service: core.ConnectionService
    ) { }

    /*@Effect()
    LoadConnections$ = this.actions$.pipe(ofType(actions.LOAD_CONNECTIONS),
        switchMap(() =>
            this.service.getConnections().pipe(
                map((connections: core.ConnectionModel[]) => new actions.LoadConnectionsSuccess(connections)),
                catchError(error => of(new actions.LoadConnectionsFail(error)))
            )
        )
    );*/

    @Effect()
    AddConnection$ = this.actions$.pipe(ofType(actions.ADD_CONNECTION),
        concatMap((action: actions.AddConnection) => [new actions.AddConnectionSuccess(action.payload as core.ConnectionModel),
            new actionsHistory.ActionHistory(action), new actionsExperience.SetHasChanges(true)])
    );

    @Effect()
    UpdateConnection$ = this.actions$.pipe(ofType(actions.UPDATE_CONNECTION),
        map((action: actions.UpdateConnection) => new actions.UpdateConnectionSuccess(action.payload))
    );

    @Effect()
    removeConnection$ = this.actions$.pipe(ofType(actions.REMOVE_CONNECTION),
        concatMap((action: actions.RemoveConnection) => [new actions.RemoveConnectionSuccess(action.payload as ConnectionModel),
            new actionsHistory.ActionHistory(action), new actionsExperience.SetHasChanges(true)])
    );

}
