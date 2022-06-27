import { Component, ViewChild, ElementRef } from '@angular/core';
import { DetectionService } from './services/detection.service';

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
  @ViewChild('img') public imageEl!: ElementRef;
  @ViewChild('canvas', { read: ElementRef, static: false }) canvas!: ElementRef<any>;

  constructor(
    private detectionService: DetectionService
  ) { }

  public ngOnInit(): void {
  }

  public async fileChangeEvent(event: any): Promise<void> {
    if (event.target.files && event.target.files[0]) {
      this.isLoading = true;
      let files: FileList = event.target.files;
      let file: File = files[0];

      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (res: any) => {
        this.imageSrc = res.target.result;
        setTimeout(async () => {
          this.detectionService.getPredictions(file).subscribe((res) => {
            this.predictions = res;
            console.log('res', res);
            this.renderPredictions(res);
            this.isLoading = false;

          }, (err) => {
            this.isLoading = false;
            console.log('err', err);
          })
        }, 0);
      };
    }
  }

  renderPredictions(predictions: Array<Prediction>): void {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width  = 300;
    canvas.height = 300;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Fonts
    const font = "16px sans-serif";
    ctx.font = '16px open-sans';
    ctx.textBaseline = 'top';

    const image = <HTMLImageElement>document.getElementById('image');
    // const sw = image.width || width;
    // const sh = image.height || height;
    //  const h2 = width / sw * sh;
    // ctx.drawImage(image, 0, 0, sw, sh);
    //  ctx.drawImage(image, 0, 0, sw, sh, 0, 0, width, h2);
    ctx.drawImage(image, 0, 0, 300, 300);
    ctx.font = '10px Arial';

    predictions.forEach((prediction: Prediction) => {
      const x = prediction.x;
      const y = prediction.y;
      const width = prediction.width;
      const height = prediction.height;

      // Bounding box
      ctx.strokeStyle = '#0074df';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Label background
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.clase).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
      ctx.fillStyle = "#000000";
      ctx.fillText(`${prediction.clase}` , x, y);
    });
  };


  // WIP
  // renderPredictions(predictions: Array<Prediction>): void {
  //   const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  //   const ctx = canvas.getContext('2d');

  //   const width = canvas.width;
  //   const height = canvas.height;

  //   if (!ctx) return;
  //   ctx.save();


  //   // canvas.width  = width;
  //   // canvas.height = height;
  //   // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  //   // canvas.width = 300;
  //   // canvas.height = 300;
  //   ctx.clearRect(0, 0, width, height);

  //   // Fonts
  //   const font = "16px sans-serif";
  //   ctx.font = '16px open-sans';
  //   ctx.textBaseline = 'top';

  //   const image = <HTMLImageElement>document.getElementById('image');
  //   const sw = image.width || width;
  //   const sh = image.height || height;
  //    const h2 = width / sw * sh;
  //   // ctx.drawImage(image, 0, 0, sw, sh);
  //   //  ctx.drawImage(image, 0, 0, sw, sh, 0, 0, width, h2);
  //   ctx.font = '10px Arial';

  //   predictions.forEach((prediction: Prediction) => {
  //     const x = prediction.x;
  //     const y = prediction.y;
  //     const width = prediction.width;
  //     const height = prediction.height;

  //     // Bounding box
  //     ctx.strokeStyle = '#0074df';
  //     ctx.lineWidth = 2;
  //     ctx.strokeRect(x, y, width, height);

  //     // Label background
  //     ctx.fillStyle = "#00FFFF";
  //     const textWidth = ctx.measureText(prediction.clase).width;
  //     const textHeight = parseInt(font, 10); // base 10
  //     ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
  //     ctx.fillStyle = "#000000";
  //     ctx.fillText(`${prediction.clase}` , x, y);
  //   });
  // };

  async tick(res: Array<Prediction>): Promise<void> {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const w = canvas.width;
    const h = canvas.height;


    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    ctx.save();

    ctx.clearRect(0, 0, w, h);
    const image = <HTMLImageElement>document.getElementById('image');
    const sw = image.width || w;
    const sh = image.height || h;
    const h2 = w / sw * sh;
    ctx.drawImage(image, 0, 0, sw, sh, 0, 0, w, h2);

    ctx.globalCompositeOperation = 'source-over';
    await this.draw(ctx, { image, w }, res);
    ctx.restore();
  };

  async draw(g: any, param: any, predictions: Array<Prediction>) {
    // const predictions = await model.detect(param.image);
    const dw = param.w;
    const w = param.image.width || dw;
    const r = dw / w;
    const classes = [];


    // const threathold = parseFloat(thrinp.value);
    for (const pred of predictions) {
      // if (pred.score > threathold) {
      // const p = document.createElement('p');

      // ====
      const x = pred.x;
      const y = pred.y;
      const width = pred.width;
      const height = pred.height;
      // ====
      

      const conf = Math.round(pred.score * 100);
      const cls = pred.clase;
      const n = (() => {
        const n = classes.indexOf(cls);
        if (n >= 0) {
          return n;
        }
        classes.push(cls);
        return classes.length;
      })();
      const txt = `${cls} ${conf}%`;
      // const b = pred.bbox.map(d => d * r);
      // console.log(b);
      const color = `hsl(${360 / 10 * n},50%,50%)`;
      g.fillStyle = color;
      g.font = "20px serif";
      g.fillText(txt, x, y - 5);

      g.strokeStyle = color;
      g.lineWidth = 4;
      g.strokeRect(x, y, width, height);
    }
  };
}
