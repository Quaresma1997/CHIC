import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { switchMap, map, catchError, debounceTime, distinctUntilChanged, concatMap } from 'rxjs/operators';
import { of, empty, Observable } from 'rxjs';

import * as navigation from './../../../../store';
import * as actions from './../actions/experience.actions';
import { ExperienceModel } from 'src/app/core/models';
import { ExperienceService } from 'src/app/core/services';

@Injectable()
export class ExperienceEffects {
    constructor(
        private actions$: Actions,
        private service: ExperienceService
    ) { }

    @Effect()
    LoadExperiences$ = this.actions$.pipe(ofType(actions.LOAD_EXPERIENCES),
        switchMap(() =>
            this.service.getExperiences().pipe(
                map((experiences: ExperienceModel[]) => new actions.LoadExperiencesSuccess(experiences)),
                catchError(error => of(new actions.LoadExperiencesFail(error)))
            )
        )
    );
}
