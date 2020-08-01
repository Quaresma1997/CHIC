import { Injectable } from '@angular/core';

import { Plugins } from '@capacitor/core';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

const { Storage } = Plugins;

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
    constructor() {
    }

    async set(k: string, value: any): Promise<void> {
        await Storage.set({
            key: k,
            value: JSON.stringify(value)
        });
    }

    async get(k: string): Promise<any> {
        const item = await Storage.get({ key: k });
        return JSON.parse(item.value);
    }

    async remove(k: string): Promise<void> {
        await Storage.remove({
            key: k
        });
    }

    async keys(): Promise<any> {
        const { keys } = await Storage.keys();
        return keys;
    }

    async getExperiencesCompleted(key): Promise<any> {
        const activities = await this.get(key);
        if (activities == null) {
            return false;
        }
        if (Object.keys(activities).length === 0) {
            return false;
        }
        for (const id of Object.keys(activities)) {
            if (typeof activities[id] === 'boolean') {
                if (!activities[id]) {
                    return false;
                }
            } else {
                return false;
            }
        }

        return true;
    }

    async setActivityCompletedTrue(experienceId, activityId) {
        const activities = await this.get(experienceId);
        if (activities != null) {
            activities[activityId] = true;
            await this.set(experienceId, activities);
        } else {
            const newActs = {};
            newActs[activityId] = true;
            await this.set(experienceId, newActs);
        }
    }

    async setActivityCompletedFalse(experienceId, activityId) {
        const activities = await this.get(experienceId);
        if (activities != null) {
            if (Object.keys(activities).length > 0) {
                if (activities[activityId] == null) {
                    activities[activityId] = false;
                    await this.set(experienceId, activities);
                }
            } else {
                activities[activityId] = false;
                await this.set(experienceId, activities);
            }

        } else {
            const newActs = {};
            newActs[activityId] = false;
            await this.set(experienceId, newActs);
        }
    }

    async setActivityGoalsCompleted(experienceId, activityId, goals) {
        // console.log(goals);
        const activities = await this.get(experienceId);
        if (activities != null && Object.keys(activities).length > 0) {
            if (activities[activityId] != null) {
                if (typeof activities[activityId] === 'boolean') {
                    if (!activities[activityId]) {
                        activities[activityId] = goals;
                        await this.set(experienceId, activities);
                    }
                } else {
                    const newGoals = [];
                    for (const [i, v] of goals.entries()) {
                        newGoals.push((v || activities[activityId][i]));
                    }
                    activities[activityId] = newGoals;
                    await this.set(experienceId, activities);
                }
            } else {
                activities[activityId] = goals;
                await this.set(experienceId, activities);
            }


        } else {
            const actId = {};
            actId[activityId] = goals;
            await this.set(experienceId, actId);
        }

    }

    async setExperienceFavourite(insert, experienceId) {
        const favourites = await this.get('favourites');
        if (favourites != null && favourites.length > 0) {
            if (insert) {
                favourites.push(experienceId);
            } else {
                const index = favourites.indexOf(experienceId);
                if (index > -1) {
                    favourites.splice(index, 1);
                }
            }
            await this.set('favourites', favourites);
        } else {
            if (insert) {
                await this.set('favourites', [experienceId]);
            }
        }
    }


    async setActivitySequence(experienceId, activityId) {
        const activities = await this.get(experienceId + '_sequence');
        if (activities != null && activities.length > 0) {
            activities.push(activityId);
            await this.set(experienceId + '_sequence', activities);
        } else {
            await this.set(experienceId + '_sequence', [activityId]);
        }
    }


}
