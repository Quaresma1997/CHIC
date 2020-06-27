import { InMemoryDbService } from 'angular-in-memory-web-api';
import * as models from '../models';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const experiences = [
      { id: 1, title: 'Experiencia1', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.', date: '01/01/20', image: './../../../assets/imgs/picture_placeholder.png' },
      { id: 2, title: 'Experiencia2', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.', date: '01/01/20', image: './../../../assets/imgs/picture_placeholder.png' },
      { id: 3, title: 'Experiencia3', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.', date: '01/01/20', image: './../../../assets/imgs/picture_placeholder.png' },
      { id: 4, title: 'Experiencia4', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.', date: '01/01/20', image: './../../../assets/imgs/picture_placeholder.png' },
      { id: 5, title: 'Experiencia5', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.', date: '01/01/20', image: './../../../assets/imgs/picture_placeholder.png' },
      { id: 6, title: 'Experiencia6', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.', date: '01/01/20', image: './../../../assets/imgs/picture_placeholder.png' },
      { id: 7, title: 'Experiencia7', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.', date: '01/01/20', image: './../../../assets/imgs/picture_placeholder.png' },
      { id: 8, title: 'Experiencia8', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.', date: '01/01/20', image: './../../../assets/imgs/picture_placeholder.png' },
      { id: 9, title: 'Experiencia9', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.', date: '01/01/20', image: './../../../assets/imgs/picture_placeholder.png' },
      { id: 10, title: 'Experiencia10', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis egestas consequat. Vivamus sit amet imperdiet arcu. Suspendisse venenatis lorem.', date: '01/01/20', image: './../../../assets/imgs/picture_placeholder.png' },
    ];

    const activities = [
      { id: 1, experienceId: 1, title: 'Activity1', description: 'Description', moduleId: 1, lat: 41.1336300, lng: -8.6174200, pinColor: '#ffffff', tags: 'A, B, C', startActivity: true, proximity: 0, startHour: 0, endHour: 23, days: ['Segunda', 'Quarta'] },
      { id: 2, experienceId: 1, title: 'Activity2', description: 'Description', moduleId: 2, lat: 41.1265, lng: -8.6134200, pinColor: '#ffffff', tags: 'A, B, C', startActivity: false, proximity: 0, startHour: 0, endHour: 23 },
      { id: 3, experienceId: 1, title: 'Activity3', description: 'Description', moduleId: 3, lat: 41.123267, lng: -8.6114200, pinColor: '#ffffff', tags: 'A, B, C', startActivity: false, proximity: 0, startHour: 0, endHour: 23 },
      { id: 4, experienceId: 2, title: 'Activity4', description: 'Description', moduleId: 1, lat: 41.130832, lng: -8.6174200, pinColor: '#ffffff', tags: 'A, B, C', startActivity: true, proximity: 0, startHour: 0, endHour: 23 },
      { id: 5, experienceId: 2, title: 'Activity5', description: 'Description', moduleId: 2, lat: 41.1336300, lng: -8.6154200, pinColor: '#ffffff', tags: 'A, B, C', startActivity: false, proximity: 0, startHour: 0, endHour: 23 },
      { id: 6, experienceId: 3, title: 'Activity6', description: 'Description', moduleId: 3, lat: 41.1336300, lng: -8.6174200, pinColor: '#ffffff', tags: 'A, B, C', startActivity: true, proximity: 0, startHour: 0, endHour: 23 },
    ];

    const modules = [
      { id: 1, title: 'Módulo Básico', image: './../../../assets/imgs/module1.png', description: 'Insira uma média. Utilizador a visualiza no ponto de interesse' },
      { id: 2, title: 'Módulo Banda Sonora', image: './../../../assets/imgs/module2.png', description: 'Ativa banda sonora quando utilizador chega ao ponto de interesse' },
      { id: 3, title: 'Módulo Sonar', image: './../../../assets/imgs/module3.png', description: 'Utilizador procurar ponto de interesse através de um radar sonar' },
      { id: 4, title: 'Módulo Visual Overlay', image: './../../../assets/imgs/module4.png', description: 'Utilizador deve alinhar ecrã do telemovel com espaço físico' },
      { id: 5, title: 'Módulo Básico', image: './../../../assets/imgs/module1.png', description: 'Insira uma média. Utilizador a visualiza no ponto de interesse' },
      { id: 6, title: 'Módulo Banda Sonora', image: './../../../assets/imgs/module2.png', description: 'Ativa banda sonora quando utilizador chega ao ponto de interesse' },
      { id: 7, title: 'Módulo Sonar', image: './../../../assets/imgs/module3.png', description: 'Utilizador procurar ponto de interesse através de um radar sonar' },
      { id: 8, title: 'Módulo Visual Overlay', image: './../../../assets/imgs/module4.png', description: 'Utilizador deve alinhar ecrã do telemovel com espaço físico' },
      { id: 9, title: 'Módulo Básico', image: './../../../assets/imgs/module1.png', description: 'Insira uma média. Utilizador a visualiza no ponto de interesse' },
      { id: 10, title: 'Módulo Banda Sonora', image: './../../../assets/imgs/module2.png', description: 'Ativa banda sonora quando utilizador chega ao ponto de interesse' },
      { id: 11, title: 'Módulo Sonar', image: './../../../assets/imgs/module3.png', description: 'Utilizador procurar ponto de interesse através de um radar sonar' },
      { id: 12, title: 'Módulo Visual Overlay', image: './../../../assets/imgs/module4.png', description: 'Utilizador deve alinhar ecrã do telemovel com espaço físico' },
    ];

    const connections = [
      { id: 1, experienceId: 1, sourceId: 'n1', targetId: 'n2', edgeId: 'wewe1' },
      { id: 2, experienceId: 1, sourceId: 'n1', targetId: 'n3', edgeId: 'wewe2' },
      { id: 3, experienceId: 1, sourceId: 'n2', targetId: 'n1', edgeId: 'wewe3' },
      { id: 4, experienceId: 1, sourceId: 'n2', targetId: 'n3', edgeId: 'wewe4' },
      { id: 5, experienceId: 1, sourceId: 'n3', targetId: 'n1', edgeId: 'wewe5' },
      { id: 6, experienceId: 1, sourceId: 'n3', targetId: 'n2', edgeId: 'wewe6' },
      { id: 7, experienceId: 2, sourceId: 'n4', targetId: 'n5', edgeId: 'wewe7' },
      { id: 8, experienceId: 2, sourceId: 'n5', targetId: 'n4', edgeId: 'wewe8' },
    ];
    return { experiences, activities, modules, connections };
  }

  /*genId<T extends models.ExperienceModel | models.ActivityModel | models.ModuleModel | models.ConnectionModel>(myTable: T[]): number {
    return myTable.length > 0 ? Math.max(...myTable.map(t => t.id)) + 1 : 1;
  }*/
}
