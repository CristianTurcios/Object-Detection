import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoDetectionComponent } from './video-detection.component';

describe('VideoDetectionComponent', () => {
  let component: VideoDetectionComponent;
  let fixture: ComponentFixture<VideoDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoDetectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
