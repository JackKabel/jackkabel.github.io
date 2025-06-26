import {Component, ElementRef, ViewChild, OnDestroy} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {CameraDevice, Html5Qrcode} from 'html5-qrcode';
import {
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  ViewWillEnter,
  ViewWillLeave
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
  imports: [NgIf, IonIcon, IonSelect, IonSelectOption, NgForOf, IonSpinner, IonButton],
})
export class QrScannerComponent implements ViewWillEnter, ViewWillLeave, OnDestroy {
  @ViewChild('qrCodeContainer') qrCodeContainer!: ElementRef;
  qrResult: string | null = null;
  cameras: CameraDevice[] = [];
  selectedCameraId: string | null = null;
  isScanning = false;
  isLoading = false;

  private html5QrCode?: Html5Qrcode;
  private mutationObserver?: MutationObserver;
  private readonly QR_REGION_ID = 'qr-code-region';

  async ionViewWillEnter(): Promise<void> {
    await this.initializeScanner();
  }

  async ionViewWillLeave(): Promise<void> {
    await this.cleanup();
  }

  ngOnDestroy(): void {
    void this.cleanup();
  }

  private async initializeScanner(): Promise<void> {
    try {
      this.qrResult = null;
      this.selectedCameraId = null;
      this.isLoading = true;

      await this.cleanup();

      await new Promise(resolve => setTimeout(resolve, 100));

      this.html5QrCode = new Html5Qrcode(this.QR_REGION_ID);

      const cameras = await Html5Qrcode.getCameras();
      this.cameras = cameras;

      if (cameras.length > 0) {
        const backCamera = cameras.find(cam =>
          cam.label?.toLowerCase().includes('back') ||
          cam.label?.toLowerCase().includes('rear')
        );
        this.selectedCameraId = backCamera?.id || cameras[0].id;
        await this.startScannerWithCamera(this.selectedCameraId);
      }
    } catch (error) {
      console.error('Failed to initialize scanner:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onCameraSelected(event: any): Promise<void> {
    const selectedId = event.detail.value;
    this.selectedCameraId = selectedId;
    await this.startScannerWithCamera(selectedId);
  }

  private async startScannerWithCamera(cameraId: string): Promise<void> {
    if (!this.html5QrCode || this.isScanning) return;

    try {
      if (this.isScanning) {
        await this.stopScanner();
      }

      this.isScanning = true;

      await this.html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          this.qrResult = decodedText;
          this.stopScanner();
        },
        (errorMessage) => {
          if (!errorMessage.includes('No MultiFormat Readers')) {
            console.warn('QR scan error:', errorMessage);
          }
        }
      );

      this.styleVideoElement();

    } catch (error) {
      console.error('Failed to start camera:', error);
      this.isScanning = false;
    }
  }

  private styleVideoElement(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    this.mutationObserver = new MutationObserver(() => {
      const video = this.qrCodeContainer?.nativeElement?.querySelector('video');
      if (video) {
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.borderRadius = '12px';

        if (this.mutationObserver) {
          this.mutationObserver.disconnect();
          this.mutationObserver = undefined;
        }
      }
    });

    if (this.qrCodeContainer?.nativeElement) {
      this.mutationObserver.observe(this.qrCodeContainer.nativeElement, {
        childList: true,
        subtree: true,
      });
    }
  }

  private async stopScanner(): Promise<void> {
    if (this.html5QrCode && this.isScanning) {
      try {
        await this.html5QrCode.stop();
      } catch (error) {
        console.warn('Error stopping scanner:', error);
      } finally {
        this.isScanning = false;
      }
    }
  }

  private async cleanup(): Promise<void> {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }

    if (this.html5QrCode) {
      try {
        if (this.isScanning) {
          await this.html5QrCode.stop();
        }
        this.html5QrCode.clear();
      } catch (error) {
        console.warn('Error during cleanup:', error);
      } finally {
        this.html5QrCode = undefined;
        this.isScanning = false;
      }
    }
  }

  async restartScanning(): Promise<void> {
    this.qrResult = null;
    if (this.selectedCameraId) {
      await this.startScannerWithCamera(this.selectedCameraId);
    }
  }
}
