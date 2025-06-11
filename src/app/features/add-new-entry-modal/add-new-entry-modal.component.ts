import {Component, inject, Input, OnInit} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController
} from '@ionic/angular/standalone';
import {FormsModule} from '@angular/forms';
import {WorkEntryService} from '../../core/work-entry.service';
import {IonicModule, ModalController} from '@ionic/angular';
import {WorkEntry} from '../../models/work-entry.model';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'app-add-new-entry-modal',
  templateUrl: './add-new-entry-modal.component.html',
  styleUrls: ['./add-new-entry-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule, CommonModule, BrowserModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonDatetime,
    FormsModule,
    IonInput,
    IonTextarea,
    IonFooter
  ]
})
export class AddNewEntryModalComponent implements OnInit {
  @Input() flowId: string = '';
  @Input() oldEntry?: WorkEntry;

  maxDate = new Date().toISOString();
  date: string = new Date().toISOString();
  hours: number = 8;
  note: string = '';
  private workService = inject(WorkEntryService);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);

  ngOnInit() {
    if (this.oldEntry) {
      this.date = this.oldEntry.date;
      this.hours = this.oldEntry.hours;
      this.note = this.oldEntry.note || '';
    }
  }

  async saveEntry() {
    if (!this.isFormValid()) return;

    let entryData = {
      id: Date.now().toString(),
      flowId: this.flowId,
      date: this.date.split('T')[0],
      hours: Number(this.hours),
      note: this.note?.trim() || undefined
    };
    if (this.oldEntry) {
      entryData = {
        id: this.oldEntry.id,
        flowId: this.oldEntry.flowId,
        date: this.date.split('T')[0],
        hours: Number(this.hours),
        note: this.note?.trim() || undefined
      };
    }

    if (this.oldEntry) {
      try {
        await this.workService.updateEntry(entryData);
        await this.presentToast('Entry updated successfully', 'success');
        this.dismissModal('saved');
      } catch (error) {
        void this.presentToast('Error updating entry', 'danger');
        this.dismissModal('canceled');
      }
    } else {
      try {
        await this.workService.addEntry(entryData);
        await this.presentToast('Entry saved successfully', 'success');
        this.dismissModal('saved');
      } catch (error) {
        void this.presentToast('Error saving entry', 'danger');
        this.dismissModal('canceled');
      }
    }
  }

  dismissModal(role: 'canceled' | 'saved') {
    void this.modalController.dismiss(null, role)
  }

  isFormValid(): boolean {
    return !!(
      this.date &&
      this.hours &&
      this.hours > 0
    );
  }

  async presentToast(message: string, color?: string, icon?: string) {
    const toast = await this.toastController.create({
      message: message,
      color: color ? color : undefined,
      icon: icon ? icon : undefined,
      duration: 1500,
      position: 'bottom',
    });

    await toast.present();
  }
}
