import {Component, OnInit, ViewChild} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonTitle,
  IonToast,
  IonToolbar,
  IonBadge
} from '@ionic/angular/standalone';
import {FormsModule} from '@angular/forms';
import {WorkEntryService} from '../../core/work-entry.service';


@Component({
  selector: 'app-one',
  templateUrl: './one.component.html',
  styleUrls: ['./one.component.scss'],
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonModal,
    IonInput,
    FormsModule,
    IonToolbar,
    IonButtons,
    IonDatetime,
    IonFooter,
    IonHeader,
    IonTitle,
    IonItem,
    IonToast,
    IonBadge
  ]
})
export class OneComponent implements OnInit {
  date: string = new Date().toISOString();
  hours: number = 8;
  note?: string;
  @ViewChild(IonModal) modal!: IonModal;
  isToastOpen = false;

  constructor(private workEntryService: WorkEntryService) {
  }

  ngOnInit() {
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  cancel() {
    void this.modal.dismiss();
  }

  confirm() {
    void this.save();
    void this.modal.dismiss();
  }

  async save() {
    if (!this.date || !this.hours) return;

    await this.workEntryService.addEntry({
      date: this.date,
      hours: this.hours,
      note: this.note
    });

    this.date = new Date().toISOString();
    this.hours = 0;
    this.note = '';
    this.setOpen(true);
  }
}

