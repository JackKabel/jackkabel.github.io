import {Component, OnInit} from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip, IonToast
} from '@ionic/angular/standalone';
import {WorkEntryService} from '../../core/work-entry.service';

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
    IonToast
  ]
})
export class SettingsComponent implements OnInit {

  isToastOpen: boolean = false;

  constructor(private workEntryService: WorkEntryService) {
  }

  ngOnInit() {
  }

  clearData() {
    this.workEntryService.clearAll().then(() => this.setOpen(true));
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

}
