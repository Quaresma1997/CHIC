import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ModuleModel, ModuleAdapter } from './../models/module.model';
import { DB_URL } from '../models';
import { ToastService } from './toast.service';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class ModuleService {

    private modulesUrl = DB_URL + 'activity';  // URL to web api

    constructor(
        private http: HttpClient, private adapter: ModuleAdapter, private toastService: ToastService) { }

    /**
     * GET METHODS
     */

    /** GET modules from the server */
    getModules(): Observable<ModuleModel[]> {
        return this.http.get(this.modulesUrl)
            .pipe(
                map((data: any[]) => data.map(item => this.adapter.adapt(item))),
                tap(modules => console.log(`pop modules, ${modules}`),
                    error => this.showErrorMessage('getting', error)),
            );
    }


    private showErrorMessage(operation, error) {
        this.toastService.presentToast(`Error ${operation} module! Please check your Internet connection.`, 'danger');
        console.error(`${operation} error: ${error.message}`); // log the error to console
    }


}
