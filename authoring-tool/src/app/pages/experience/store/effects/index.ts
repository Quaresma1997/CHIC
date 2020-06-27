import { ExperienceEffects } from './experience.effects';
import { ActivityEffects } from './activity.effects';
import { ModuleEffects } from './module.effects';
import { ConnectionEffects } from './connection.effects';

export const effects: any[] = [ExperienceEffects, ActivityEffects, ModuleEffects, ConnectionEffects];

export * from './experience.effects';
export * from './activity.effects';
export * from './module.effects';
export * from './connection.effects';
