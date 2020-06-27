import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { switchMap, map, catchError, debounceTime, distinctUntilChanged, concatMap } from 'rxjs/operators';
import { of, empty, Observable } from 'rxjs';

import * as navigation from './../../../../store';
import * as core from './../../../../core';
import * as actions from './../actions/activity.actions';
import * as actionsHistory from './../actions/history.actions';
import * as actionsExperience from './../actions/experience.actions';
import { ActivityModel } from './../../../../core';


@Injectable()
export class ActivityEffects {
    constructor(
        private actions$: Actions,
        // private service: core.ActivityService
    ) { }

    /*@Effect()
    LoadActivities$ = this.actions$.pipe(ofType(actions.LOAD_ACTIVITIES),
        switchMap(() =>
            this.service.getActivities().pipe(
                map((activities: core.ActivityModel[]) => new actions.LoadActivitiesSuccess(activities)),
                catchError(error => of(new actions.LoadActivitiesFail(error)))
            )
        )
    );*/

    @Effect()
    AddActivity$ = this.actions$.pipe(ofType(actions.ADD_ACTIVITY),
        concatMap((action: actions.AddActivity) => [new actions.AddActivitySuccess(action.payload as core.ActivityModel),
            new actionsHistory.ActionHistory(action), new actionsExperience.SetHasChanges(true)]),
    );

    @Effect()
    updateActivity$ = this.actions$.pipe(ofType(actions.UPDATE_ACTIVITY),
        concatMap((action: actions.UpdateActivity) => [new actions.UpdateActivitySuccess(action.payload, action.redo, action.undo),
            new actionsHistory.ActionHistory(action), new actionsExperience.SetHasChanges(true)]),
    );


    @Effect()
    removeActivity$ = this.actions$.pipe(ofType(actions.REMOVE_ACTIVITY),
        concatMap((action: actions.RemoveActivity) => [new actions.RemoveActivitySuccess(action.payload as ActivityModel),
            new actionsHistory.ActionHistory(action), new actionsExperience.SetHasChanges(true)]),
    );

}
