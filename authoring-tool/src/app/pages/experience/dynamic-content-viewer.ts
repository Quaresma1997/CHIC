import {
    Component, NgModule, VERSION, ComponentFactoryResolver, InjectionToken, Injector, ElementRef,
    Output, Input, EventEmitter, ComponentFactory, ComponentRef, OnDestroy, DoCheck, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { ActivityModel, ModuleModel } from 'src/app/core';
import { DynamicComponent } from './components';
import { Subscription } from 'rxjs';

@Component({
    selector: 'content-viewer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: '',
})
export class ContentViewerComponent implements OnDestroy, DoCheck {
    private hostElement: HTMLElement;
    private embeddedComponentFactories: Map<string, ComponentFactory<any>> = new Map();
    private embeddedComponents: ComponentRef<any>[] = [];

    activity: ActivityModel;
    module: ModuleModel;

    images: any[];
    videos: any[];
    audios: any[];

    subscription: Subscription;

    @Output()
    docRendered = new EventEmitter();

    constructor(
        componentFactoryResolver: ComponentFactoryResolver,
        elementRef: ElementRef,
        public cd: ChangeDetectorRef,
        private injector: Injector,
    ) {
        this.hostElement = elementRef.nativeElement;
        const factory = componentFactoryResolver.resolveComponentFactory(DynamicComponent);
        this.embeddedComponentFactories.set(factory.selector, factory);
    }

    @Input()
    set mod(module) {
        this.module = module;
    }

    @Input()
    set act(activity) {
        this.activity = activity;
        this.images = [];
        this.videos = [];
        this.ngOnDestroy();
        this.subscription = new Subscription();
        if (activity != null) {
            this.loadMedia();
            this.build();
            this.docRendered.emit();
        }
    }



    loadMedia() {
        this.module.htmlConfig.forEach(input => {
            const label = input.label;
            switch (input.type) {
                case 'image':
                    if (this.activity.moduleData[label] != null) {
                        this.images.push(this.activity.moduleData[label]);
                    } else {
                        this.images.push(null);
                    }
                    break;
                case 'video':
                    if (this.activity.moduleData[label] != null) {
                        this.videos.push(this.activity.moduleData[label]);
                    } else {
                        this.videos.push(null);
                    }
                    break;
                case 'audio':
                    if (this.activity.moduleData[label] != null) {
                        const audio = new Audio();
                        audio.src = this.activity.moduleData[label].url;
                        audio.load();
                        this.audios.push(audio);
                    } else {
                        this.audios.push(null);
                    }


                    break;
                default:
                    break;
            }
        });
    }

    private build() {
        this.hostElement.innerHTML = this.module.htmlWithCss || '';

        if (this.module.htmlWithCss == null) { return; }
        this.embeddedComponentFactories.forEach((factory, selector) => {
            const embeddedComponentElements = this.hostElement.querySelectorAll(selector);
            embeddedComponentElements.forEach(element => {
                // convert NodeList into an array, since Angular dosen't like having a NodeList passed
                // for projectableNodes
                const projectableNodes = [Array.prototype.slice.call(element.childNodes)];

                const embeddedComponent = factory.create(this.injector, projectableNodes, element);

                let valid = true;
                let startindex = -1;
                let count = -1;
                let media = null;

                const dataLabel = 'data';
                const typeLabel = 'type';
                // apply inputs into the dynamic component
                // only static ones work here since this is the only time they're set
                for (const attr of (element as any).attributes) {
                    switch (attr.nodeName) {
                        case 'startindex':
                            startindex = parseInt(attr.nodeValue, 10);
                            break;
                        case 'count':
                            count = parseInt(attr.nodeValue, 10);
                            break;
                        case 'data':
                            switch (attr.nodeValue) {
                                case 'title':
                                    embeddedComponent.instance[attr.nodeName] = this.activity.title;
                                    break;
                                case 'images':
                                    if (this.images.length === 0) {
                                        valid = false;
                                    } else {
                                        media = this.images;
                                    }

                                    break;
                                case 'videos':
                                    if (this.videos.length === 0) {
                                        valid = false;
                                    } else {
                                        media = this.videos;
                                    }
                                    break;
                                case 'audios':
                                    if (this.audios.length === 0) {
                                        valid = false;
                                    } else {
                                        media = this.audios;
                                    }
                                    break;
                                default:
                                    if (this.activity.moduleData[attr.nodeValue] == null ||
                                        this.activity.moduleData[attr.nodeValue] === '') {
                                        valid = false;
                                    } else {
                                        embeddedComponent.instance[attr.nodeName] = this.activity.moduleData[attr.nodeValue];
                                    }
                                    break;
                            }
                            break;
                        case 'proximity':
                        case 'time':
                            embeddedComponent.instance[attr.nodeName] = this.activity.moduleData[attr.nodeValue];
                            break;
                        case 'type':
                            if (attr.nodeValue === 'audio') {
                                const sub = embeddedComponent.instance.stopAllAudios.subscribe(() => this.stopAllAudios());
                                this.subscription.add(sub);
                            }
                            embeddedComponent.instance[attr.nodeName] = attr.nodeValue;
                            break;
                        default:
                            embeddedComponent.instance[attr.nodeName] = attr.nodeValue;
                            break;
                    }

                    if (!valid) {
                        break;
                    }

                }

                if (valid) {
                    if (media != null) {
                        if (startindex !== -1 && count !== -1) {
                            if (count === 1) {
                                media = media.slice(startindex, startindex + count)[0];
                                if (media == null) {
                                    valid = false;
                                    embeddedComponent.destroy();
                                } else {
                                    embeddedComponent.instance[dataLabel] = media;
                                }

                            } else {
                                const intermediateMedia = media.slice(startindex, startindex + count);
                                media = [];
                                intermediateMedia.forEach(med => {
                                    if (med != null) {
                                        media.push(med);
                                    }
                                });
                                if (media.length === 0) {
                                    valid = false;
                                    embeddedComponent.destroy();
                                } else if (media.length === 1) {
                                    if (embeddedComponent.instance[typeLabel] === 'slider') {
                                        embeddedComponent.instance[typeLabel] = 'image';
                                    }
                                    embeddedComponent.instance[dataLabel] = media[0];
                                } else {
                                    embeddedComponent.instance[dataLabel] = media;
                                }
                            }

                        }

                    }
                    if (valid) {
                        this.embeddedComponents.push(embeddedComponent);
                    }

                } else {
                    embeddedComponent.destroy();
                }

            });

        });
    }

    ngDoCheck() {
        this.embeddedComponents.forEach(comp => comp.changeDetectorRef.detectChanges());
    }

    stopAllAudios() {
        if (this.audios != null) {
            this.audios.forEach(audio => {
                if (audio != null) {
                    audio.pause();
                    audio.currentTime = 0;
                }

            });
        }

        this.embeddedComponents.forEach(comp => comp.instance.stopAudio());

    }

    deleteAudios() {
        this.stopAllAudios();
        this.audios = [];

    }

    ngOnDestroy() {
        this.deleteAudios();
        this.embeddedComponents.forEach(comp => comp.destroy());
        this.embeddedComponents.length = 0;
        if (this.subscription != null) {
            this.subscription.unsubscribe();
        }

    }
}

