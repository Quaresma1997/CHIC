import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ExperienceModel, ExperienceAdapter } from './../models/experience.model';

import {DB_URL} from '../models';
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
        tap(experiences => console.log(`fetched experiences`),
          error => this.showErrorMessage('getting', error)),
      );
  }

  private showErrorMessage(operation, error) {
    this.toastService.presentToast(`Error ${operation} experience! Please check your Internet connection.`, 'danger');
    console.error(`${operation} error: ${error.message}`); // log the error to console
  }

}
