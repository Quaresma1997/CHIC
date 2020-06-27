import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {
  @Input() images: [];
  slideIndex = 0;
  constructor(
    public cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.showSlides(this.slideIndex);
  }

  plusSlides(n) {
    this.showSlides(this.slideIndex += n);
  }

  currentSlide(n) {
    this.showSlides(this.slideIndex = n);
  }

  showSlides(n) {
    if (n > this.images.length - 1) { this.slideIndex = 0; }
    if (n < 0) { this.slideIndex = this.images.length - 1; }
    this.cd.detectChanges();
  }

}
