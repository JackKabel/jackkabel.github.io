import {Component, inject, Input, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ModalController,
  ToastController
} from "@ionic/angular/standalone";
import {WorkEntryService} from '../../core/work-entry.service';
import {WorkFlow} from '../../models/work-flow.model';
import {CommonModule} from '@angular/common';
import {themeColor} from "../../models/theme-color.model";

@Component({
  selector: 'app-add-new-flow-modal',
  templateUrl: './add-new-flow-modal.component.html',
  styleUrls: ['./add-new-flow-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonTextarea,
    IonTitle,
    IonToolbar
  ]
})
export class AddNewFlowModalComponent implements OnInit {
  @Input() oldFlow?: WorkFlow;

  name: string = '';
  description: string = '';
  private workService = inject(WorkEntryService);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);

  ngOnInit() {
    if (this.oldFlow) {
      this.name = this.oldFlow.name;
      this.description = this.oldFlow.description || '';
    }
  }

  async saveFlow() {
    if (!this.isFormValid()) return;

    const newFlow: WorkFlow = {
      id: this.oldFlow?.id || this.name,
      name: this.name,
      description: this.description
    };

    if (this.oldFlow) {
      try {
        await this.workService.updateFlow(newFlow);
        await this.presentToast('Flow edited successfully', 'success');
        this.dismissModal('saved');
      } catch (error) {
        void this.presentToast('Error editing flow', 'danger');
        this.dismissModal('canceled');
      }
    } else {
      try {
        await this.workService.addFlow(newFlow);
        await this.presentToast('Flow saved successfully', 'success');
        this.dismissModal('saved');
      } catch (error) {
        void this.presentToast('Error saving flow', 'danger');
        this.dismissModal('canceled');
      }
    }
  }

  dismissModal(role: 'canceled' | 'saved') {
    void this.modalController.dismiss(null, role)
  }

  isFormValid(): boolean {
    return !!this.name;
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

    protected readonly themeColor = themeColor;
}
