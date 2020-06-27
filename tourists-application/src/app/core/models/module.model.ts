import { Adapter } from '../adapter';
import { Injectable } from '@angular/core';

export class ModuleModel {
    public id: string;
    public title: string;
    public image: string;
    public description: string;

    public htmlConfig: any;

    public htmlWithCss: string;

    constructor(id: string, name: string, properties: any[], htmlCss: string) {
        this.id = id;
        this.title = name;
        this.image = properties[0].image;
        this.description = properties[0].description;
        this.htmlConfig = properties[0].htmlConfig;

        this.htmlWithCss = htmlCss;
    }
}

@Injectable({
    providedIn: 'root'
})
export class ModuleAdapter implements Adapter<ModuleModel> {
    adapt(item: any): ModuleModel {
        // return new ModuleModel(item._id, item.name, item.properties, item.json_params, item.style_url);
        return new ModuleModel(item._id, item.name, item.properties, item.json_params);
    }
}
