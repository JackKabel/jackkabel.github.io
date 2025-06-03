import {Component} from '@angular/core';
import {IonBadge, IonContent, IonIcon, IonText} from '@ionic/angular/standalone';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  imports: [
    IonContent,
    IonIcon,
    FormsModule,
    IonBadge,
    IonText
  ]
})
export class AboutComponent {

}

