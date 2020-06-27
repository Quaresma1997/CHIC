import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import * as core from './../../../../core';
import * as store from './../../../../store';
import { Store } from '@ngrx/store';
import * as ELG from 'esri-leaflet-geocoder';

@Component({
  selector: 'app-activity-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss'],
})
export class ActivityItemComponent implements OnInit {
  @Input() activity: core.ActivityModel;
  @Input() distance: number;
  @Input() blocked: boolean;
  @Input() completed: boolean;
  @Input() experienceId: string;
  address: string;
  constructor(private st: Store<store.AppState>, public cd: ChangeDetectorRef) { }

  ngOnInit() {
    // console.log(this.activity);
    this.distance = this.activity.distance;
    this.address = null;
    this.setActivityInstanceAddress(this.activity.lat, this.activity.lng);
    this.cd.detectChanges();
  }



  startActivity() {
    this.st.dispatch(new store.Go({ path: ['/experiences/' + this.experienceId + '/' + this.activity.id] }));
  }

  setActivityInstanceAddress(lat, lng) {
    ELG.geocodeService().reverse().latlng([lat, lng]).run((error, result) => {
      if (error != null) {
        console.log(error);
        return;
      }

      this.address = result.address.LongLabel;
      this.cd.detectChanges();
    });
  }

}
