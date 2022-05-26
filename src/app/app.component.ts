import { ChangeDetectorRef, Component, HostListener, ViewChild } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Socket } from 'ngx-socket-io';
import { WebcamImage } from 'ngx-webcam';
import { CameraComponent } from './camera/camera.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CatDetection';
  width: number = 0;
  height: number = 0;
  modelLoaded: boolean = false;
  private video!: HTMLVideoElement;
  webcamImages: Array<any> = [];
  @ViewChild(CameraComponent) camera!:CameraComponent;
  cats = [
    {
      imageUrl: 'https://machinethink.net/images/bounding-boxes/cat@2x.jpg',
      text: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
    },
    {
      imageUrl: 'https://nanonets.github.io/tutorials-page/docs/assets/annotation-guidelines/tight-bb-wrong.jpg',
      text: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
    },
    {
      imageUrl: 'https://miro.medium.com/max/1400/0*5q24DtFRyZQzDUu1.jpg',
      text: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
    },
    {
      imageUrl: 'https://d1m75rqqgidzqn.cloudfront.net/wp-data/2020/07/23225538/3-1024x984.jpg',
      text: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
    },
    {
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDt3_CDqh9nmreXQHp4rS2CRoKPXHYoPVPaofZ9aeqW8SRswwPuErY9TG2xJcxWEQQYB8&usqp=CAU',
      text: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
    },
    {
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTJI7gfgEJ7mDM2eFbcjK32qhqJKhzVw9UU3ChvJ87whnuUJjKe06GxdLlzpACc9xFTag&usqp=CAU',
      text: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
    },
    {
      imageUrl: 'https://i.stack.imgur.com/X68wH.jpg',
      text: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
    },
    {
      imageUrl: 'https://meenavyas.files.wordpress.com/2018/11/out1.jpg?w=720',
      text: 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'
    },
  ];

  constructor(
    // private socket: Socket,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    const win = !!event ? (event.target as Window) : window;
    this.width = win.innerWidth;
    this.height = win.innerHeight;
  }

  videoStream($event: HTMLVideoElement): void {
    this.video = $event;
    this.predictWithCocoModel();
  }

  handleSnapshot(snapshot: string): void {
    this.webcamImages.push({
      imageUrl: snapshot,
    });
  }

  async predictWithCocoModel(): Promise<void> {
    console.log('loading model');
    const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
    console.log('loaded');
    this.modelLoaded = true;
    this.detectFrame(this.video, model);
  }

  async detectFrame(video: any, model: any): Promise<void> {
    if (model) {
      // Send video via socket
      // this.socket.emit('message', video);
      const predictions = await model.detect(video);
      this.renderPredictions(predictions);
      requestAnimationFrame(async () => await this.detectFrame(video, model));
    }
  }

  async renderPredictions(predictions: any): Promise<void> {    
    const canvas = <HTMLCanvasElement>document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = "16px sans-serif";
    ctx.font = '16px open-sans';
    ctx.textBaseline = 'top';

    predictions.forEach((prediction: any) => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];

      ctx.strokeStyle = '#0074df';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };
  //
}
