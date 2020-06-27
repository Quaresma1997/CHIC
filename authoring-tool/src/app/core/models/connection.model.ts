export class ConnectionModel {
    public id: number;
    public sourceId: number; // node source id
    public targetId: number; // node target id
    public edgeId: string;

    constructor(sId: number, tId: number, newEdgeId: string, newId?: number) {
        this.id = newId;
        // this.experienceId = expId;
        this.sourceId = sId;
        this.targetId = tId;
        this.edgeId = newEdgeId;
    }
}
