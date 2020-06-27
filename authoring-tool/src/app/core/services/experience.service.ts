import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ExperienceModel, ExperienceAdapter } from './../models/experience.model';

import { DB_URL } from '../models';
import { ToastService } from './toast.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class ExperienceService {

  private experiencesUrl = DB_URL + 'iap';  // URL to web api

  constructor(
    private http: HttpClient, private adapter: ExperienceAdapter, private toastService: ToastService) { }

  /**
   * GET METHODS
   */

  /** GET experiences from the server */
  getExperiences(): Observable<ExperienceModel[]> {
    return this.http.get(this.experiencesUrl)
      .pipe(
        map((data: any[]) => data.map(item => this.adapter.adapt(item))),
        tap(experiences => console.log(`fetched experiences, ${experiences}`),
          error => this.showErrorMessage('getting', error)),
      );
  }

  /**
   * POST METHODS
   */

  /** POST: add a new experience to the server */
  addExperience(experience: ExperienceModel): Observable<ExperienceModel> {
    const newExperience = this.adapter.convertToObject(experience);
    return this.http.post(this.experiencesUrl, newExperience, httpOptions).pipe(
      map((data: any) => this.adapter.adapt(data)),
      tap(
        _ => this.toastService.presentToast(`Created experience ${experience.title}`, 'success'),
        error => this.showErrorMessage('creating', error)),
    );
  }

  /**
   * PUT METHODS
   */

  /** PUT: update an experience on the server */
  updateExperience(experience: ExperienceModel): Observable<ExperienceModel> {
    // console.log(experience);
    const newExperience = this.adapter.convertToObject(experience);
    const url = `${this.experiencesUrl}/${newExperience._id}`;
    return this.http.put(url, newExperience, httpOptions).pipe(
      map((data: any) => this.adapter.adapt(data)),
      tap(
        _ => this.toastService.presentToast(`Updated experience ${experience.title}`, 'success'),
        error => this.showErrorMessage('updating', error)),
    );
  }

  /**
   * DELETE METHODS
   */

  /** DELETE: delete an experience from the server */
  deleteExperience(experienceId: string): Observable<ExperienceModel> {
    const url = `${this.experiencesUrl}/${experienceId}`;

    return this.http.delete<any>(url, httpOptions).pipe(
      tap(_ => this.toastService.presentToast(`Experience deleted`, 'success'),
        error => this.showErrorMessage('deleting', error)),
    );
  }





  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private showErrorMessage(operation, error) {
    this.toastService.presentToast(`Error ${operation} experience! Please check your Internet connection.`, 'danger');
    console.error(`${operation} error: ${error.message}`); // log the error to console
  }

}
