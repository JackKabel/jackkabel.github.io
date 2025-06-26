import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {NgIf} from '@angular/common';
import {Html5Qrcode} from 'html5-qrcode';
import {IonIcon, ViewWillEnter, ViewWillLeave} from '@ionic/angular/standalone';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
  imports: [NgIf, IonIcon],
})
export class QrScannerComponent implements ViewWillEnter, ViewWillLeave {
  @ViewChild('qrCodeContainer') qrCodeContainer!: ElementRef;
  qrResult: string | null = null;
  private html5QrCode?: Html5Qrcode;

  ionViewWillEnter(): void {
    const qrRegionId = this.qrCodeContainer.nativeElement.id;
    this.html5QrCode = new Html5Qrcode(qrRegionId);

    Html5Qrcode.getCameras().then(cameras => {
      if (cameras && cameras.length) {
        // Try to find the back camera
        const backCamera = cameras.find(cam =>
          cam.label.toLowerCase().includes('back') ||
          cam.label.toLowerCase().includes('rear') ||
          cam.label.toLowerCase().includes('environment')
        );

        const selectedCameraId = backCamera?.id || cameras[0].id;

        this.html5QrCode?.start(
          selectedCameraId,
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            this.qrResult = decodedText;
            this.html5QrCode?.stop();
          },
          (errorMessage) => {
            console.warn(errorMessage);
          }
        );

        // 🔍 Observe DOM mutations to style video when ready
        const observer = new MutationObserver(() => {
          const video = this.qrCodeContainer.nativeElement.querySelector('video');
          if (video) {
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.borderRadius = '12px';

            observer.disconnect(); // ✅ Stop once done
          }
        });

        observer.observe(this.qrCodeContainer.nativeElement, {
          childList: true,
          subtree: true,
        });
      }
    }).catch(err => console.error(err));
  }


  ionViewWillLeave(): void {
    this.html5QrCode?.stop().then(() => {
      this.html5QrCode?.clear();
    });
  }
}
