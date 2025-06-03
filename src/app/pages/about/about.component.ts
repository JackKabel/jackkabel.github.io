import {Component} from '@angular/core';
import {
  IonBadge,
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
  IonToolbar
} from '@ionic/angular/standalone';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
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
export class AboutComponent {

}

