export class ActivityModel {
    public id: number;
    public title: string;
    public moduleData: any;
    public moduleId: string;
    public lat: number;
    public lng: number;
    public pinColor: string;
    public tags: string;
    public startActivity: boolean;
    public finalActivity: boolean;
    public proximity: number;
    public startHour: number;
    public endHour: number;
    public days: string[];

    constructor(
        title: string, moduleData: any,
        moduleId: string, lat: number, lng: number, pinColor: string, tags: string,
        startActivity: boolean, finalActivity: boolean,
        proximity: number, startHour: number, endHour: number, days: string[], id?: number) {
        this.id = id;
        this.title = title;
        this.moduleData = moduleData;
        this.moduleId = moduleId;
        this.lat = lat;
        this.lng = lng;
        this.pinColor = pinColor;
        this.tags = tags;
        this.startActivity = startActivity;
        this.finalActivity = finalActivity;
        this.proximity = proximity;
        this.startHour = startHour;
        this.endHour = endHour;
        this.days = days;
    }
}
