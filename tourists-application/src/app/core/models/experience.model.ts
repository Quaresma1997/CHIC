import { ConnectionModel } from './connection.model';
import { ActivityModel } from './activity.model';
import { Adapter } from '../adapter';
import { Injectable } from '@angular/core';

export class ExperienceModel {
    public id: string;
    public title: string;
    // public category: string;
    public description: string;
    public date: string;
    public image: string;
    public published: boolean;
    public tags: string;

    public location: { lat: number, lng: number };

    public completed: boolean;
    public favourite: boolean;

    public activities: ActivityModel[];
    public connections: ConnectionModel[];

    constructor(id: string, name: string, properties: any[], nodes: any[], edges: any[]) {
        this.id = id;
        this.title = name;
        if (properties.length !== 0) {
            this.description = properties[0].description;
            this.date = properties[0].date;
            this.image = properties[0].image;
            this.published = properties[0].published;
            this.tags = properties[0].tags;
        } else {
            // tslint:disable-next-line:max-line-length
            this.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.';
            this.date = '01/01/20';
            this.image = './../../../assets/imgs/picture_placeholder.svg';
            this.published = false;
            this.tags = '';
        }
        this.completed = false;
        this.favourite = false;
        this.activities = [];
        this.connections = [];

        nodes.forEach(node => {
            if (node.properties != null) {
                const nodeProperties = node.properties[0];
                if (this.checkActivityHasData(nodeProperties.moduleData)) {
                    const newActivity = new ActivityModel(nodeProperties.title,
                        nodeProperties.moduleData, nodeProperties.moduleId,
                        nodeProperties.lat, nodeProperties.lng, nodeProperties.pinColor, nodeProperties.tags,
                        nodeProperties.startActivity, nodeProperties.finalActivity, nodeProperties.proximity, nodeProperties.startHour,
                        nodeProperties.endHour, nodeProperties.days, node.act_id);

                    this.activities.push(newActivity);
                }
            }
        });

        // console.log(this.activities);

        if (this.activities.length === 0) {
            return;
        }

        let activity: ActivityModel;
        for (const act of this.activities) {
            if (act.startActivity) {
                activity = act;
                break;
            }
        }
        if (activity == null) {
            activity = this.activities[0];
        }

        // console.log(activity);
        this.location = { lat: activity.lat, lng: activity.lng };

        edges.forEach(connection => {
            if (connection.properties != null) {
                const connectionProperties = connection.properties[0];
                const newConnection = new ConnectionModel(
                    connection.source, connection.target, connectionProperties.edgeId, connectionProperties.id);
                this.connections.push(newConnection);
            }
        });

    }

    private checkActivityHasData(moduleData) {
        if (moduleData != null) {
            for (const key of Object.keys(moduleData)) {
                if (moduleData[key] != null && moduleData[key] !== '') {
                    return true;
                }
            }
        }

        return false;
    }
}



@Injectable({
    providedIn: 'root'
})
export class ExperienceAdapter implements Adapter<ExperienceModel> {
    adapt(item: any): ExperienceModel {
        // console.log(item);
        return new ExperienceModel(item._id, item.name, item.properties, item.nodes, item.edges);
    }
}
