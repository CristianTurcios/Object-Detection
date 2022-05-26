import { NgModule } from '@angular/core';
import { WebcamModule } from 'ngx-webcam';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CameraComponent } from './camera/camera.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { CardComponent } from './card/card.component';
import { FooterComponent } from './footer/footer.component';

// const config: SocketIoConfig = { url: environment.apiUrl, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    CameraComponent,
    CardComponent,
    FooterComponent
  ],
  imports: [
    WebcamModule,
    BrowserModule,
    // SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
