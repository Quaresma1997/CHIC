import { Component, OnInit, ChangeDetectorRef, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ActionsSubject, Store, select } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import * as actions from './../../store/actions';
import { ofType } from '@ngrx/effects';
import * as store from './../../../experience/store';
import { take } from 'rxjs/operators';
import * as core from './../../../../core';
import { ToastService } from './../../../../core';


@Component({
  selector: 'app-undo-redo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './undo-redo.component.html',
  styleUrls: ['./undo-redo.component.scss'],
})
export class UndoRedoComponent implements OnInit, OnDestroy {
  @Output() closeUpdateForm: EventEmitter<any> = new EventEmitter();

  undo$: Observable<actions.HistoryActivityAction | actions.HistoryConnectionAction>;
  redo$: Observable<actions.HistoryActivityAction | actions.HistoryConnectionAction>;

  undoDisabled = false;
  redoDisabled = false;
  subscription = new Subscription();
  nextAction: actions.HistoryActivityAction | actions.HistoryConnectionAction;
  previousAction: actions.HistoryActivityAction | actions.HistoryConnectionAction;

  constructor(
    private st: Store<store.DashboardState>,
    private actionsSubject: ActionsSubject,
    public cd: ChangeDetectorRef,
    private toastService: ToastService, ) { }

  ngOnInit() {
    this.undo$ = this.st.pipe(select(store.getActionsPrevious));
    this.redo$ = this.st.pipe(select(store.getActionsNext));

    this.start();
  }

  toggleButtons() {
    this.st.pipe(select(store.getActionsNext, take(1))).subscribe(value => this.nextAction = value);
    this.redoDisabled = this.nextAction == null;
    this.st.pipe(select(store.getActionsPrevious, take(1))).subscribe(value => this.previousAction = value);
    this.undoDisabled = this.previousAction == null;
    this.cd.detectChanges();
  }

  start() {
    this.subscription = new Subscription();
    const sub1 = this.undo$.subscribe(action => {
      this.toggleButtons();
    });
    this.subscription.add(sub1);

    const sub2 = this.redo$.subscribe(action => {
      this.toggleButtons();
    });
    this.subscription.add(sub2);
  }

  destroy() {
    this.subscription.unsubscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  undoAction() {
    this.undoDisabled = true;
    this.redoDisabled = true;
    if (this.previousAction != null) {
      this.closeUpdateForm.emit();
      switch (this.previousAction.type) {
        case actions.ADD_ACTIVITY:
          this.st.dispatch(new store.RemoveActivity(this.previousAction.payload, false, true));
          this.toastService.presentToast(`Undo: activity created`, 'success');
          return;
        case actions.UPDATE_ACTIVITY:
          this.st.dispatch(new store.UpdateActivity(this.previousAction.payload, false, true));
          this.toastService.presentToast(`Undo: activity updated`, 'success');
          return;
        case actions.REMOVE_ACTIVITY:
          this.st.dispatch(new store.AddActivity(this.previousAction.payload, false, true));
          this.toastService.presentToast(`Undo: activity deleted`, 'success');
          return;
        case actions.ADD_CONNECTION:
          this.st.dispatch(new store.RemoveConnection(this.previousAction.payload, false, true));
          this.toastService.presentToast(`Desfazer: conexão criada`, 'success');
          return;
        case actions.REMOVE_CONNECTION:
          this.st.dispatch(new store.AddConnection(this.previousAction.payload, false, true));
          this.toastService.presentToast(`Desfazer: conexão deleted`, 'success');
          return;
        default:
          return;
      }
    }
    this.st.dispatch(new store.SetHasChanges(true));
    this.cd.detectChanges();

  }

  redoAction() {
    this.undoDisabled = true;
    this.redoDisabled = true;
    if (this.nextAction != null) {
      this.closeUpdateForm.emit();
      switch (this.nextAction.type) {
        case actions.ADD_ACTIVITY:
          this.st.dispatch(new store.AddActivity(this.nextAction.payload, true, false));
          this.toastService.presentToast(`Redo: activity created`, 'success');
          return;
        case actions.UPDATE_ACTIVITY:
          this.st.dispatch(new store.UpdateActivity(this.nextAction.payload, true, false));
          this.toastService.presentToast(`Redo: activity updated`, 'success');
          return;
        case actions.REMOVE_ACTIVITY:
          this.st.dispatch(new store.RemoveActivity(this.nextAction.payload, true, false));
          this.toastService.presentToast(`Redo: activity deleted`, 'success');
          return;
        case actions.ADD_CONNECTION:
          this.st.dispatch(new store.AddConnection(this.nextAction.payload, true, false));
          this.toastService.presentToast(`Refazer: conexão criada`, 'success');
          return;
        case actions.REMOVE_CONNECTION:
          this.st.dispatch(new store.RemoveConnection(this.nextAction.payload, true, false));
          this.toastService.presentToast(`Refazer: conexão deleted`, 'success');
          return;
        default:
          return;
      }
    }
    this.st.dispatch(new store.SetHasChanges(true));
    this.cd.detectChanges();
  }

}
