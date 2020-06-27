import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as store from './../store';
import { Store } from '@ngrx/store';
import { IonMenu } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  @ViewChild('menu') menu: IonMenu;
  constructor(private st: Store<store.AppState>) { }

  ngOnInit() {}

  goHome() {
    this.st.dispatch(new store.Go({ path: ['/dashboard'] }));
    this.menu.close();
  }

  goFavourites() {
    this.st.dispatch(new store.Go({ path: ['/favourites'] }));
    this.menu.close();
  }

  goFilter() {
    this.st.dispatch(new store.Go({ path: ['/filter'] }));
    this.menu.close();
  }

}
