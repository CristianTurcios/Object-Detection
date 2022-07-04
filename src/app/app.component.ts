import { Component, ViewChild, ElementRef } from '@angular/core';
import { DetectionService } from './services/detection.service';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export interface Prediction {
  clase: string;
  height: number
  score: number;
  width: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public model: any;
  public camView: boolean = false;
  public loading = true;
  public imageSrc!: string;
  public predictions!: Prediction[];
  public isLoading: boolean = false;
  modelLoaded: boolean = false;
  public threshold: number = 95;

  @ViewChild('img') public imageEl!: ElementRef;
  @ViewChild('canvas', { read: ElementRef, static: false }) canvas!: ElementRef<any>;

  constructor(
    private detectionService: DetectionService
  ) { }

  public ngOnInit(): void {
    // this.predictWithCocoModel();
  }

  public async fileChangeEvent(event: any): Promise<void> {
    if (event.target.files && event.target.files[0]) {
      this.isLoading = true;
      let files: FileList = event.target.files;
      let file: File = files[0];
      this.clearElements();

      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (res: any) => {
        this.imageSrc = res.target.result;
        setTimeout(async () => {
          // With built-in model

          // with our custom model
          // this.renderCocoSSDPredictions();
          // this.isLoading = false;

          this.detectionService.getPredictions(file).subscribe((res) => {
            this.predictions = res;
            console.log('res', res);
            this.renderPredictions(res);
            this.isLoading = false;

          }, (err) => {
            this.isLoading = false;
            console.log('err', err);
          });
        }, 0);
      };
    }
  }

  async predictWithCocoModel(): Promise<void> {
    console.log('loading model');
    this.isLoading = true;
    this.model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
    console.log('loaded');
    this.isLoading = false;
  }

  async renderCocoSSDPredictions(): Promise<void> {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const image = <HTMLImageElement>document.getElementById('image');
    const result: any = await this.model.detect(image);

    ctx.drawImage(image, 0, 0);
    ctx.font = '10px Arial';

    console.log('number of detections: ', result.length);
    for (let i = 0; i < result.length; i++) {
      ctx.beginPath();
      console.log(result[i]);

      ctx.rect(result[i].bbox[0], result[i].bbox[1], result[i].bbox[2], result[i].bbox[3]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'green';
      ctx.fillStyle = 'green';
      ctx.stroke();
      ctx.fillText(
        result[i].score.toFixed(3) + ' ' + result[i].class, result[i].bbox[0],
        result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10);
    }
  }

  onChange(threshold: number): void {    
    this.renderPredictions(this.predictions);
  }

  // WIP
  async renderPredictions(predictions: Array<Prediction>): Promise<void> {
    if(!predictions) return;
    
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const image = <HTMLImageElement>document.getElementById('image');

    ctx.drawImage(image, 0, 0);
    const font = "16px sans-serif";
    ctx.font = '16px open-sans';
    ctx.textBaseline = 'top';

    console.log('number of detections: ', predictions.length);

    const filteredPredictions = predictions.filter((element: Prediction) => element.score >= this.threshold);

    filteredPredictions.forEach((prediction: Prediction) => {
      ctx.beginPath();
      const x = prediction.x;
      const y = prediction.y;
      const width = prediction.width;
      const height = prediction.height;

      ctx.rect(x, y, width, height);
      ctx.strokeStyle = '#0074df';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(`${prediction.clase} ${prediction.score}%`).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
      ctx.fillStyle = "#000000";
      ctx.fillText(`${prediction.clase} ${prediction.score}%`, prediction.x, prediction.y);
    });
  };

  clearElements(): void {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
