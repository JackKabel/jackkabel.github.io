import {Component, ElementRef, ViewChild, OnDestroy} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {CameraDevice, Html5Qrcode} from 'html5-qrcode';
import {IonIcon, IonSelect, IonSelectOption, ViewWillEnter, ViewWillLeave} from '@ionic/angular/standalone';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
  imports: [NgIf, IonIcon, IonSelect, IonSelectOption, NgForOf],
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
    this.cleanup();
  }

  private async initializeScanner(): Promise<void> {
    try {
      // Reset state
      this.qrResult = null;
      this.selectedCameraId = null;
      this.isLoading = true;

      // Ensure any existing scanner is fully cleaned up
      await this.cleanup();

      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new instance
      this.html5QrCode = new Html5Qrcode(this.QR_REGION_ID);

      // Get available cameras
      const cameras = await Html5Qrcode.getCameras();
      this.cameras = cameras;

      // iOS-specific camera selection logic
      if (cameras.length > 0) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isIOS) {
          // On iOS, prefer environment camera (back camera)
          const backCamera = cameras.find(cam =>
            cam.label?.toLowerCase().includes('back') ||
            cam.label?.toLowerCase().includes('rear') ||
            cam.label?.toLowerCase().includes('environment')
          );

          // If no back camera found, try to identify by camera index
          // Usually camera 0 is front, camera 1 is back on iOS
          const fallbackBackCamera = cameras.length > 1 ? cameras[1] : cameras[0];

          this.selectedCameraId = backCamera?.id || fallbackBackCamera.id;
        } else {
          // Non-iOS logic (original)
          const backCamera = cameras.find(cam =>
            cam.label?.toLowerCase().includes('back') ||
            cam.label?.toLowerCase().includes('rear')
          );
          this.selectedCameraId = backCamera?.id || cameras[0].id;
        }

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
      // Stop any existing scan first
      if (this.isScanning) {
        await this.stopScanner();
      }

      // Force complete cleanup and recreation for iOS camera switching
      await this.html5QrCode.clear();

      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 200));

      this.isScanning = true;

      // Use facingMode for iOS instead of deviceId
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      let cameraConstraint;
      if (isIOS) {
        // On iOS, use facingMode which is more reliable
        const selectedCamera = this.cameras.find(cam => cam.id === cameraId);
        const isBackCamera = selectedCamera?.label?.toLowerCase().includes('back') ||
          selectedCamera?.label?.toLowerCase().includes('rear') ||
          selectedCamera?.label?.toLowerCase().includes('environment') ||
          selectedCamera?.label?.toLowerCase().includes('world');

        cameraConstraint = { facingMode: isBackCamera ? 'environment' : 'user' };
      } else {
        cameraConstraint = cameraId;
      }

      const config = {
        fps: isIOS ? 5 : 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await this.html5QrCode.start(
        cameraConstraint,
        config,
        (decodedText) => {
          this.qrResult = decodedText;
          this.stopScanner();
        },
        (errorMessage) => {
          if (!errorMessage.includes('No MultiFormat Readers') &&
            !errorMessage.includes('NotFoundException')) {
            console.warn('QR scan error:', errorMessage);
          }
        }
      );

      // Style the video element once it's available
      this.styleVideoElement();

    } catch (error) {
      console.error('Failed to start camera:', error);
      this.isScanning = false;
    }
  }

  private styleVideoElement(): void {
    // Clean up any existing observer
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

        // Stop observing once we've styled the video
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
    // Clean up mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }

    // Stop and clear scanner
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

  // Method to restart scanning after successful scan
  async restartScanning(): Promise<void> {
    this.qrResult = null;
    if (this.selectedCameraId) {
      await this.startScannerWithCamera(this.selectedCameraId);
    }
  }

  // Helper method to get user-friendly camera labels
  getCameraLabel(camera: CameraDevice, index: number): string {
    if (camera.label) {
      // Clean up common camera label patterns
      let label = camera.label;

      // Replace common patterns with user-friendly names
      if (label.toLowerCase().includes('back') || label.toLowerCase().includes('rear') || label.toLowerCase().includes('environment')) {
        return 'Back Camera';
      } else if (label.toLowerCase().includes('front') || label.toLowerCase().includes('user') || label.toLowerCase().includes('face')) {
        return 'Front Camera';
      }

      return label;
    }

    // Fallback labels based on typical iOS camera ordering
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      return index === 0 ? 'Front Camera' : 'Back Camera';
    }

    return `Camera ${index + 1}`;
  }

  // Fallback method for iOS camera switching
  private async fallbackCameraStart(cameraId: string): Promise<void> {
    try {
      // Force complete recreation of the Html5Qrcode instance
      await this.cleanup();
      await new Promise(resolve => setTimeout(resolve, 500));

      this.html5QrCode = new Html5Qrcode(this.QR_REGION_ID);

      // Try with getUserMedia constraints directly
      const selectedCamera = this.cameras.find(cam => cam.id === cameraId);
      const constraints = {
        video: {
          deviceId: { exact: cameraId },
          facingMode: selectedCamera?.label?.toLowerCase().includes('back') ? 'environment' : 'user'
        }
      };

      // Test if camera is accessible
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop()); // Stop test stream

      // Now start with html5-qrcode
      this.isScanning = true;
      await this.html5QrCode.start(
        cameraId,
        { fps: 5, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          this.qrResult = decodedText;
          this.stopScanner();
        },
        (errorMessage) => {
          if (!errorMessage.includes('No MultiFormat Readers') &&
            !errorMessage.includes('NotFoundException')) {
            console.warn('QR scan error:', errorMessage);
          }
        }
      );

      this.styleVideoElement();
    } catch (error) {
      console.error('Fallback camera start failed:', error);
      this.isScanning = false;
    }
  }
}
