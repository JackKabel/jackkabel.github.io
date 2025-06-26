import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {NgIf} from '@angular/common';
import {Html5Qrcode} from 'html5-qrcode';
import {IonButton, IonIcon, IonSpinner, ViewWillEnter, ViewWillLeave} from '@ionic/angular/standalone';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
  imports: [NgIf, IonIcon, IonButton, IonSpinner],
})
export class QrScannerComponent implements ViewWillEnter, ViewWillLeave, OnDestroy {
  @ViewChild('qrCodeContainer') qrCodeContainer!: ElementRef;
  qrResult: string | null = null;
  isScanning = false;
  isLoading = false;
  cameraError = false;

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
    this.cleanup();
  }

  async restartScanning(): Promise<void> {
    this.qrResult = null;
    this.cameraError = false;
    await this.startScanning();
  }

  protected async initializeScanner(): Promise<void> {
    try {
      this.qrResult = null;
      this.isLoading = true;
      this.cameraError = false;

      // Ensure cleanup
      await this.cleanup();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Request back camera first (iOS needs this for permission)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {facingMode: 'environment'} // Back camera
        });
        stream.getTracks().forEach(track => track.stop());
        console.log('Back camera access granted');
      } catch (error) {
        console.log('Back camera not available, will try front camera');
      }

      // Create scanner instance
      this.html5QrCode = new Html5Qrcode(this.QR_REGION_ID);
      await this.startScanning();

    } catch (error) {
      console.error('Failed to initialize scanner:', error);
      this.cameraError = true;
    } finally {
      this.isLoading = false;
    }
  }

  private async startScanning(): Promise<void> {
    if (!this.html5QrCode || this.isScanning) return;

    try {
      this.isScanning = true;

      // Try back camera first, then front camera as fallback
      const cameraConstraints = [
        {facingMode: 'environment'} as MediaTrackConstraints, // Back camera
        {facingMode: 'user'} as MediaTrackConstraints,        // Front camera fallback
      ];

      let scannerStarted = false;

      for (const constraint of cameraConstraints) {
        try {
          await this.html5QrCode.start(
            constraint,
            {
              fps: 10,
              qrbox: {width: 250, height: 250},
              aspectRatio: 1.0
            },
            (decodedText) => {
              this.qrResult = decodedText;
              this.stopScanning();
            },
            (errorMessage) => {
              // Ignore "no QR found" messages
              if (!errorMessage.includes('No MultiFormat Readers') &&
                !errorMessage.includes('NotFoundException')) {
                console.warn('QR scan error:', errorMessage);
              }
            }
          );

          scannerStarted = true;
          console.log('Camera started with constraint:', constraint);
          break; // Success, exit the loop

        } catch (error) {
          console.log(`Failed with constraint ${JSON.stringify(constraint)}:`, error);
          // Continue to next constraint
        }
      }

      if (!scannerStarted) {
        throw new Error('No camera could be started');
      }

      // Style the video element
      this.styleVideoElement();

    } catch (error) {
      console.error('Failed to start scanning:', error);
      this.isScanning = false;
      this.cameraError = true;
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

  private async stopScanning(): Promise<void> {
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
        await this.html5QrCode.clear();
      } catch (error) {
        console.warn('Error during cleanup:', error);
      } finally {
        this.html5QrCode = undefined;
        this.isScanning = false;
      }
    }
  }
}
