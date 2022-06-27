import { ChangeDetectorRef, Component, HostListener, ViewChild } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import html2canvas from 'html2canvas';
import { CameraComponent } from '../camera/camera.component';

@Component({
  selector: 'app-video-detection',
  templateUrl: './video-detection.component.html',
  styleUrls: ['./video-detection.component.scss']
})
export class VideoDetectionComponent {
  title = 'CatDetection';
  width: number = 0;
  height: number = 0;
  modelLoaded: boolean = false;
  private video!: HTMLVideoElement;
  webcamImages: Array<any> = [];
  @ViewChild(CameraComponent) camera!:CameraComponent;

  constructor(
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
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

  async handleSnapshot(snapshot: any) {
    // The snapshot parameter get the capture without predictions, that's why I prefer to use HTML2Canvas
    const canvas = await html2canvas(<HTMLCanvasElement>document.getElementById("capture"));
    this.webcamImages.push({
      imageUrl: canvas.toDataURL(),
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

}


