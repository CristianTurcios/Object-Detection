import { Observable, Subject } from 'rxjs';
import {Component, OnInit, ChangeDetectorRef, HostListener, EventEmitter, Output, Input} from '@angular/core';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit {
  width: number = 0;
  height: number = 0;
  @Input() switchCamera: boolean = false;
  
  public showWebcam = true;
  public allowCameraSwitch = false;
  public multipleWebcamsAvailable = false;
  public deviceId: string = '';
  public facingMode: string = 'environment';
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  // public webcamImage: Array<any> = [];
  private trigger: Subject<void> = new Subject<void>();
  private video!: HTMLVideoElement;
  @Output() videoStream = new EventEmitter<HTMLVideoElement>();
  @Output() snapshot = new EventEmitter<string>();

  constructor(
    private cdRef: ChangeDetectorRef
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    const win = !!event ? (event.target as Window) : window;
    this.width = win.innerWidth;
    this.height = win.innerHeight;
  }

  ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  ngAfterViewInit(): void {
    this.onResize();
    this.readAvailableVideoInputs();
    this.video = <HTMLVideoElement>document.getElementsByTagName('video')[0];
    this.cdRef.detectChanges();
    this.video.addEventListener('loadeddata', () => this.videoStream.emit(this.video), false);
  }

  private async readAvailableVideoInputs(): Promise<void> {
    const mediaDevices: MediaDeviceInfo[] = await WebcamUtil.getAvailableVideoInputs();
    this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  handleInitError(error: WebcamInitError): void {
    if (error.mediaStreamError && error.mediaStreamError.name === 'NotAllowedError') {
      alert('User denied camera access');
    }
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {    
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.snapshot.emit(webcamImage.imageAsDataUrl);
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
    this.readAvailableVideoInputs();
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  public get videoOptions(): MediaTrackConstraints {
    const result: MediaTrackConstraints = {};
    if (this.facingMode && this.facingMode !== '') {
      result.facingMode = { ideal: this.facingMode };
    }
    return result;
  }
}
