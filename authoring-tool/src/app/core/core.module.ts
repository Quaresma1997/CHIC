import { NgModule, ModuleWithProviders } from '@angular/core';
import * as ngCommon from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';

import * as services from './services';

export const CORE_SERVICES = [
    services.ExperienceService,
    services.InMemoryDataService,
    services.ModuleService,
    services.UploadFileService,
    services.ToastService
];

@NgModule({
    imports: [
        ngCommon.CommonModule,
        HttpClientModule,
    ],
    exports: [
        RouterModule,
    ],
    declarations: [],
    providers: []
})
export class CoreModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule,
            providers: [
                ...CORE_SERVICES
            ]
        };
    }
}
