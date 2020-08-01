import { ConnectionModel } from './connection.model';
import { ActivityModel } from './activity.model';
import { Adapter } from '../adapter';
import { Injectable } from '@angular/core';
import { IAPModel } from './dbIAP.model';

export class ExperienceModel {
    public id: string;
    public title: string;
    // public category: string;
    public description: string;
    public date: string;
    public image: string;
    public published: boolean;

    public tags: string;

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
            this.description = 'Description';
            this.date = '01/06/20';
            this.image = './../../../assets/imgs/picture_placeholder.svg';
            this.published = false;
            this.tags = '';
        }
        this.activities = [];
        this.connections = [];

        nodes.forEach(node => {
            if (node.properties != null) {
                const nodeProperties = node.properties[0];
                const newActivity = new ActivityModel(nodeProperties.title,
                    nodeProperties.moduleData, nodeProperties.moduleId,
                    nodeProperties.lat, nodeProperties.lng, nodeProperties.pinColor, nodeProperties.tags,
                    nodeProperties.startActivity, nodeProperties.finalActivity, nodeProperties.proximity, nodeProperties.startHour,
                    nodeProperties.endHour, nodeProperties.days, node.act_id);
                this.activities.push(newActivity);
            }

        });

        edges.forEach(connection => {
            if (connection.properties != null) {
                const connectionProperties = connection.properties[0];
                const newConnection = new ConnectionModel(
                    connection.source, connection.target, connectionProperties.edgeId, connectionProperties.id);
                this.connections.push(newConnection);
            }
        });

        // console.log(this.activities);
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

    convertToObject(experience: ExperienceModel): IAPModel {
        const newNodes = [];
        const newEdges = [];
        // console.log(experience);
        experience.activities.forEach(act => {
            const { id, ...otherParams } = act;
            newNodes.push({ act_id: id, properties: [otherParams] });
        });

        experience.connections.forEach(con => {
            const { sourceId, targetId, ...otherParams } = con;
            newEdges.push({ source: sourceId, target: targetId, properties: [otherParams] });
        });

        return {
            _id: experience.id,
            name: experience.title,
            properties: [
                {
                    description: experience.description,
                    date: experience.date,
                    image: experience.image,
                    published: experience.published,
                    tags: experience.tags
                }
            ],
            nodes: newNodes,
            edges: newEdges

        };
    }
}
