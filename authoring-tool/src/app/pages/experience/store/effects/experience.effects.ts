import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { switchMap, map, catchError, debounceTime, distinctUntilChanged, concatMap } from 'rxjs/operators';
import { of, empty, Observable } from 'rxjs';

import * as navigation from './../../../../store';
import * as core from './../../../../core';
import * as actions from './../actions/experience.actions';

@Injectable()
export class ExperienceEffects {
    constructor(
        private actions$: Actions,
        private service: core.ExperienceService
    ) { }

    @Effect()
    LoadExperiences$ = this.actions$.pipe(ofType(actions.LOAD_EXPERIENCES),
        switchMap(() =>
            this.service.getExperiences().pipe(
                map((experiences: core.ExperienceModel[]) => new actions.LoadExperiencesSuccess(experiences)),
                catchError(error => of(new actions.LoadExperiencesFail(error)))
            )
        )
    );

    @Effect()
    createExperience$ = this.actions$.pipe(ofType(actions.CREATE_EXPERIENCE),
        map((action: actions.CreateExperience) => action.payload),
        switchMap((experience: core.ExperienceModel) =>
            this.service
                .addExperience(experience)
                .pipe(
                    map((exp: core.ExperienceModel) => new actions.CreateExperienceSuccess(exp)),
                    catchError(error => of(new actions.CreateExperienceFail(error)))
                )
        )
    );

    @Effect()
    createExperienceSuccess$ = this.actions$.pipe(ofType(actions.CREATE_EXPERIENCE_SUCCESS),
        map((action: actions.CreateExperienceSuccess) => action.payload),
        map((experience: core.ExperienceModel) =>
            new navigation.Go({
                path: ['/experiences', experience.id]
            })
        )
    );

    @Effect()
    updateExperience$ = this.actions$.pipe(ofType(actions.UPDATE_EXPERIENCE),
        map((action: actions.UpdateExperience) => action.payload),
        switchMap((experience: core.ExperienceModel) =>
            this.service
                .updateExperience(experience).pipe(
                    concatMap(() => [new actions.UpdateExperienceSuccess(experience), new actions.SetHasChanges(false)]),
                    catchError(error => of(new actions.UpdateExperienceFail(error)))
                )
        )
    );

    @Effect()
    deleteExperience$ = this.actions$.pipe(ofType(actions.DELETE_EXPERIENCE),
        map((action: actions.DeleteExperience) => action.payload),
        switchMap((experienceId: string) =>
            this.service
                .deleteExperience(experienceId)
                .pipe(
                    map(() => new actions.DeleteExperienceSuccess(experienceId)),
                    catchError(error => of(new actions.DeleteExperienceFail(error)))
                )
        )
    );

}
