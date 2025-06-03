import {Component, OnInit} from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonToast
} from '@ionic/angular/standalone';
import {WorkEntryService} from '../../core/work-entry.service';
import {HomeComponent} from '../home/home.component';
import {StandaloneService} from '../../core/standalone.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonChip,
    IonToast,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonContent,
    IonBadge,
    NgIf
  ]
})
export class SettingsComponent implements OnInit {

  isToastOpen: boolean = false;
  installPromptEvent: any;
  isStandalone = false;

  constructor(private workEntryService: WorkEntryService,
              protected standaloneService: StandaloneService) {
  this.isStandalone = this.standaloneService.isStandalone;
}

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this.installPromptEvent = event;
    });
  }

  clearData() {
    this.workEntryService.clearAll().then(() => this.setOpen(true));
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  installApp() {
    if (this.installPromptEvent) {
      this.installPromptEvent.prompt();
      this.installPromptEvent.userChoice.then((result: any) => {
        if (result.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        this.installPromptEvent = null;
      });
    }
  }
}
