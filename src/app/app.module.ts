import { NgModule } from '@angular/core';
import { WebcamModule } from 'ngx-webcam';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CameraComponent } from './camera/camera.component';
import { CardComponent } from './card/card.component';
import { FooterComponent } from './footer/footer.component';
import { VideoDetectionComponent } from './video-detection/video-detection.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    CameraComponent,
    CardComponent,
    FooterComponent,
    VideoDetectionComponent
  ],
  imports: [
    WebcamModule,
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
